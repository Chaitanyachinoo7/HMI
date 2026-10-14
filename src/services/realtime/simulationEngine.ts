/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-Performance Industrial Tag Simulation & Control Engine
 * Simulates a continuous physical Water Treatment & Booster Pumping Facility
 * adhering to ISA-101 / PlantPAx equipment profiles with sub-second telemetry updates.
 */

import {
  TagMetadata,
  TagValue,
  ActiveAlarm,
  AlarmSeverity,
  MotorTelemetry,
  ValveTelemetry,
  DeviceCommand
} from '../../types/hmi';
import { soundService } from '../soundService';

export interface TrendDataPoint {
  timestamp: number;
  value: number;
}

class SimulationEngine {
  private timer: number | null = null;
  private subscribers: Map<string, Set<(tag: TagValue) => void>> = new Map();
  private alarmSubscribers: Set<(alarms: ActiveAlarm[]) => void> = new Set();
  private motorSubscribers: Map<string, Set<(motor: MotorTelemetry) => void>> = new Map();
  private valveSubscribers: Map<string, Set<(valve: ValveTelemetry) => void>> = new Map();

  // Historical memory buffers for time-series trending
  private trendHistories: Map<string, TrendDataPoint[]> = new Map();
  private maxHistoryPoints: number = 300;

  // Process Tags Registry & Metadata
  public readonly metadataRegistry: Map<string, TagMetadata> = new Map([
    [
      'Plant1/Water/Reservoir/Level',
      {
        path: 'Plant1/Water/Reservoir/Level',
        name: 'Reservoir Level',
        description: 'Clearwell Finished Water Storage Reservoir Level',
        area: 'Treatment Plant 1',
        unit: 'Water Storage',
        datatype: 'float',
        engineeringUnits: '%',
        euMin: 0,
        euMax: 100,
        normalMin: 45,
        normalMax: 85,
        lowLowLimit: 15,
        lowLimit: 30,
        highLimit: 90,
        highHighLimit: 96,
      },
    ],
    [
      'Plant1/Water/Discharge/Pressure',
      {
        path: 'Plant1/Water/Discharge/Pressure',
        name: 'Discharge Pressure',
        description: 'Main Header Discharge Distribution Pressure',
        area: 'Distribution Pumping',
        unit: 'Header',
        datatype: 'float',
        engineeringUnits: 'kPa',
        euMin: 0,
        euMax: 700,
        normalMin: 380,
        normalMax: 480,
        lowLowLimit: 250,
        lowLimit: 340,
        highLimit: 520,
        highHighLimit: 600,
      },
    ],
    [
      'Plant1/Water/Total/Flow',
      {
        path: 'Plant1/Water/Total/Flow',
        name: 'Total Plant Flow',
        description: 'Effluent Distribution Total Process Flow',
        area: 'Effluent',
        unit: 'Flow Measurement',
        datatype: 'float',
        engineeringUnits: 'L/s',
        euMin: 0,
        euMax: 200,
        normalMin: 65,
        normalMax: 140,
        lowLowLimit: 20,
        lowLimit: 50,
        highLimit: 160,
        highHighLimit: 185,
      },
    ],
    [
      'Plant1/Water/Chlorine/Free',
      {
        path: 'Plant1/Water/Chlorine/Free',
        name: 'Free Residual Chlorine',
        description: 'Disinfection Residual Free Chlorine Analyzer',
        area: 'Quality Compliance',
        unit: 'Analyzers',
        datatype: 'float',
        engineeringUnits: 'mg/L',
        euMin: 0,
        euMax: 5.0,
        normalMin: 1.2,
        normalMax: 2.2,
        lowLowLimit: 0.5,
        lowLimit: 0.8,
        highLimit: 2.8,
        highHighLimit: 3.5,
      },
    ],
    [
      'Plant1/Water/Chlorine/Total',
      {
        path: 'Plant1/Water/Chlorine/Total',
        name: 'Total Chlorine',
        description: 'Effluent Total Combined Chlorine Analyzer',
        area: 'Quality Compliance',
        unit: 'Analyzers',
        datatype: 'float',
        engineeringUnits: 'mg/L',
        euMin: 0,
        euMax: 6.0,
        normalMin: 1.8,
        normalMax: 2.8,
        lowLowLimit: 0.8,
        lowLimit: 1.2,
        highLimit: 3.4,
        highHighLimit: 4.2,
      },
    ],
    [
      'Plant1/Water/Settling/Turbidity',
      {
        path: 'Plant1/Water/Settling/Turbidity',
        name: 'Clarifier Turbidity',
        description: 'Settling Basin Effluent Nephelometric Turbidity',
        area: 'Clarification',
        unit: 'Basin 1',
        datatype: 'float',
        engineeringUnits: 'NTU',
        euMin: 0,
        euMax: 10,
        normalMin: 0.1,
        normalMax: 0.8,
        lowLowLimit: 0.0,
        lowLimit: 0.05,
        highLimit: 1.5,
        highHighLimit: 3.0,
      },
    ],
    [
      'Plant1/Water/Header/Temperature',
      {
        path: 'Plant1/Water/Header/Temperature',
        name: 'Process Water Temperature',
        description: 'Inlet Water Stream Bulk Temperature',
        area: 'Intake',
        unit: 'Raw Feed',
        datatype: 'float',
        engineeringUnits: '°C',
        euMin: 0,
        euMax: 50,
        normalMin: 12,
        normalMax: 24,
        lowLowLimit: 2,
        lowLimit: 6,
        highLimit: 30,
        highHighLimit: 38,
      },
    ],
  ]);

  // Current live tag values
  private currentTags: Map<string, TagValue> = new Map();

  // Active alarms list
  private activeAlarms: ActiveAlarm[] = [];

  // Motor instances (e.g. LB01 Lead Booster, LB02 Lag Booster, MTR-103 Backwash)
  private motors: Map<string, MotorTelemetry> = new Map([
    [
      'Plant1/Booster/LB01',
      {
        tagPath: 'Plant1/Booster/LB01',
        name: 'LB01 Booster Pump (Lead)',
        state: 'RUNNING',
        mode: 'AUTO',
        inService: true,
        interlocksOk: true,
        permissivesOk: true,
        runFeedback: true,
        currentAmps: 41.3,
        ratedAmps: 60.0,
        speedRpm: 1765,
        speedSetpoint: 1750,
        vibrationMmS: 2.1,
        windingTempC: 68.4,
        runningHours: 1284.5,
        alarmActive: false,
      },
    ],
    [
      'Plant1/Booster/LB02',
      {
        tagPath: 'Plant1/Booster/LB02',
        name: 'LB02 Booster Pump (Lag / Standby)',
        state: 'STOPPED',
        mode: 'AUTO',
        inService: true,
        interlocksOk: true,
        permissivesOk: true,
        runFeedback: false,
        currentAmps: 0.0,
        ratedAmps: 60.0,
        speedRpm: 0,
        speedSetpoint: 1500,
        vibrationMmS: 0.2,
        windingTempC: 28.1,
        runningHours: 842.1,
        alarmActive: false,
      },
    ],
    [
      'Plant1/Intake/P101',
      {
        tagPath: 'Plant1/Intake/P101',
        name: 'P-101 Raw Water Intake Pump',
        state: 'RUNNING',
        mode: 'AUTO',
        inService: true,
        interlocksOk: true,
        permissivesOk: true,
        runFeedback: true,
        currentAmps: 52.8,
        ratedAmps: 75.0,
        speedRpm: 1480,
        speedSetpoint: 1480,
        vibrationMmS: 2.8,
        windingTempC: 74.2,
        runningHours: 3410.2,
        alarmActive: false,
      },
    ],
  ]);

  // Valve instances (e.g. FCV-101 Modulating Flow Control, XV-102 Emergency Shutoff)
  private valves: Map<string, ValveTelemetry> = new Map([
    [
      'Plant1/Valves/FCV101',
      {
        tagPath: 'Plant1/Valves/FCV101',
        name: 'FCV-101 Effluent Discharge Control Valve',
        state: 'OPEN',
        mode: 'AUTO',
        inService: true,
        isModulating: true,
        positionPercent: 64.2,
        setpointPercent: 65.0,
        openFeedback: true,
        closedFeedback: false,
        travelTimeSec: 8.5,
        inletPressureKPa: 420.5,
        outletPressureKPa: 385.0,
        alarmActive: false,
      },
    ],
    [
      'Plant1/Valves/XV102',
      {
        tagPath: 'Plant1/Valves/XV102',
        name: 'XV-102 Chemical Dosing Isolation Valve',
        state: 'OPEN',
        mode: 'AUTO',
        inService: true,
        isModulating: false,
        positionPercent: 100,
        setpointPercent: 100,
        openFeedback: true,
        closedFeedback: false,
        travelTimeSec: 4.0,
        inletPressureKPa: 210.0,
        outletPressureKPa: 205.0,
        alarmActive: false,
      },
    ],
    [
      'Plant1/Valves/BV103',
      {
        tagPath: 'Plant1/Valves/BV103',
        name: 'BV-103 Filter Backwash Bypass Valve',
        state: 'CLOSED',
        mode: 'MANUAL',
        inService: true,
        isModulating: false,
        positionPercent: 0,
        setpointPercent: 0,
        openFeedback: false,
        closedFeedback: true,
        travelTimeSec: 5.0,
        inletPressureKPa: 350.0,
        outletPressureKPa: 0.0,
        alarmActive: false,
      },
    ],
  ]);

  constructor() {
    this.initTagsAndHistory();
    this.startSimulationLoop();
  }

  private initTagsAndHistory() {
    const now = Date.now();
    // Pre-populate historical trend curves (past 5 minutes)
    for (const [path, meta] of this.metadataRegistry) {
      const history: TrendDataPoint[] = [];
      const baseValue = (meta.normalMin + meta.normalMax) / 2;
      let runningVal = baseValue;

      for (let i = this.maxHistoryPoints; i >= 0; i--) {
        const t = now - i * 1000;
        const noise = (Math.sin(i / 10) * (meta.normalMax - meta.normalMin) * 0.15) + (Math.random() - 0.5) * 0.8;
        runningVal = Math.min(meta.euMax, Math.max(meta.euMin, baseValue + noise));
        history.push({ timestamp: t, value: Number(runningVal.toFixed(2)) });
      }

      this.trendHistories.set(path, history);
      this.currentTags.set(path, {
        path,
        value: runningVal,
        timestamp: now,
        quality: 'GOOD',
        setpoint: baseValue,
      });
    }

    // Seed realistic initial alarm (Medium Priority)
    this.activeAlarms = [
      {
        id: 'ALM-001',
        tagPath: 'Plant1/Water/Settling/Turbidity',
        tagDescription: 'Clarifier Turbidity High Alarm Threshold',
        area: 'Clarification',
        severity: 'MEDIUM',
        state: 'UNACK_ALARM',
        condition: 'High Turbidity Limit Exceeded',
        value: 1.62,
        limit: 1.5,
        timestamp: now - 34000,
      },
      {
        id: 'ALM-002',
        tagPath: 'Plant1/Booster/LB01',
        tagDescription: 'LB01 Booster High Winding Temp Advisory',
        area: 'Distribution Pumping',
        severity: 'LOW',
        state: 'ACK_ALARM',
        condition: 'Motor Stator Temp > 65°C',
        value: '68.4°C',
        limit: 65.0,
        timestamp: now - 120000,
        acknowledgedAt: now - 60000,
        acknowledgedBy: 'OPERATOR_1',
      },
    ];
  }

  private startSimulationLoop() {
    if (typeof window === 'undefined') return;

    this.timer = window.setInterval(() => {
      this.tick();
    }, 500); // 500ms cycle rate (standard ISA-101 recommendation)
  }

  private tick() {
    const now = Date.now();

    // 1. Physical Process Simulation Step
    const lb01 = this.motors.get('Plant1/Booster/LB01')!;
    const lb02 = this.motors.get('Plant1/Booster/LB02')!;
    const fcv = this.valves.get('Plant1/Valves/FCV101')!;

    const lb01Running = lb01.state === 'RUNNING';
    const lb02Running = lb02.state === 'RUNNING';

    // Update Reservoir level based on intake vs discharge
    const resTag = this.currentTags.get('Plant1/Water/Reservoir/Level')!;
    const pumpDrain = (lb01Running ? 0.08 : 0) + (lb02Running ? 0.08 : 0);
    const inflow = 0.12; // raw intake inflow
    let newLevel = (resTag.value as number) + (inflow - pumpDrain) + (Math.random() - 0.5) * 0.04;
    newLevel = Math.max(10, Math.min(98, newLevel));
    resTag.value = Number(newLevel.toFixed(2));
    resTag.timestamp = now;

    // Update Discharge Pressure based on running pumps and valve position
    const pressTag = this.currentTags.get('Plant1/Water/Discharge/Pressure')!;
    let targetPress = 0;
    if (lb01Running && lb02Running) targetPress = 530;
    else if (lb01Running || lb02Running) targetPress = 420;
    else targetPress = 30;
    // Valve resistance effect
    targetPress -= (fcv.positionPercent - 50) * 0.6;
    const currentPress = pressTag.value as number;
    const newPress = currentPress + (targetPress - currentPress) * 0.15 + (Math.random() - 0.5) * 1.5;
    pressTag.value = Number(newPress.toFixed(1));
    pressTag.timestamp = now;

    // Total Flow L/s
    const flowTag = this.currentTags.get('Plant1/Water/Total/Flow')!;
    let targetFlow = 0;
    if (lb01Running && lb02Running) targetFlow = 165;
    else if (lb01Running || lb02Running) targetFlow = 98;
    targetFlow = targetFlow * (fcv.positionPercent / 100);
    const currFlow = flowTag.value as number;
    const newFlow = Math.max(0, currFlow + (targetFlow - currFlow) * 0.2 + (Math.random() - 0.5) * 1.2);
    flowTag.value = Number(newFlow.toFixed(1));
    flowTag.timestamp = now;

    // Free & Total Chlorine
    const freeCl = this.currentTags.get('Plant1/Water/Chlorine/Free')!;
    const totCl = this.currentTags.get('Plant1/Water/Chlorine/Total')!;
    const freeVal = Math.max(0.5, Math.min(4.0, (freeCl.value as number) + (Math.random() - 0.5) * 0.02));
    freeCl.value = Number(freeVal.toFixed(3));
    freeCl.timestamp = now;
    totCl.value = Number((freeVal + 0.45 + (Math.random() - 0.5) * 0.01).toFixed(3));
    totCl.timestamp = now;

    // Turbidity
    const turbTag = this.currentTags.get('Plant1/Water/Settling/Turbidity')!;
    turbTag.value = Number(Math.max(0.1, Math.min(5.0, (turbTag.value as number) + (Math.random() - 0.48) * 0.03)).toFixed(2));
    turbTag.timestamp = now;

    // Temperature
    const tempTag = this.currentTags.get('Plant1/Water/Header/Temperature')!;
    tempTag.value = Number((18.4 + Math.sin(now / 60000) * 0.8 + (Math.random() - 0.5) * 0.1).toFixed(1));
    tempTag.timestamp = now;

    // 2. Motor dynamic changes (vibration, heat, amps)
    if (lb01Running) {
      lb01.currentAmps = Number((41.0 + (newPress - 400) * 0.03 + (Math.random() - 0.5) * 0.6).toFixed(1));
      lb01.speedRpm = Math.round(1750 + (Math.random() - 0.5) * 10);
      lb01.vibrationMmS = Number((2.1 + (Math.random() - 0.5) * 0.1).toFixed(2));
      lb01.windingTempC = Number((lb01.windingTempC + 0.01).toFixed(1));
      lb01.runningHours = Number((lb01.runningHours + 0.0001).toFixed(2));
    } else {
      lb01.currentAmps = 0;
      lb01.speedRpm = 0;
      lb01.vibrationMmS = 0.1;
      lb01.windingTempC = Math.max(25, Number((lb01.windingTempC - 0.05).toFixed(1)));
    }

    if (lb02Running) {
      lb02.currentAmps = Number((40.5 + (Math.random() - 0.5) * 0.5).toFixed(1));
      lb02.speedRpm = Math.round(1740 + (Math.random() - 0.5) * 8);
      lb02.vibrationMmS = Number((1.8 + (Math.random() - 0.5) * 0.1).toFixed(2));
      lb02.windingTempC = Number((lb02.windingTempC + 0.02).toFixed(1));
      lb02.runningHours = Number((lb02.runningHours + 0.0001).toFixed(2));
    } else {
      lb02.currentAmps = 0;
      lb02.speedRpm = 0;
      lb02.vibrationMmS = 0.1;
      lb02.windingTempC = Math.max(24, Number((lb02.windingTempC - 0.04).toFixed(1)));
    }

    // 3. Modulating Valve tracking setpoint
    if (Math.abs(fcv.positionPercent - fcv.setpointPercent) > 0.5) {
      const dir = Math.sign(fcv.setpointPercent - fcv.positionPercent);
      fcv.positionPercent = Number(Math.max(0, Math.min(100, fcv.positionPercent + dir * 2.5)).toFixed(1));
      fcv.state = dir > 0 ? 'OPENING' : 'CLOSING';
    } else {
      fcv.positionPercent = fcv.setpointPercent;
      fcv.state = fcv.positionPercent > 0 ? 'OPEN' : 'CLOSED';
    }
    fcv.inletPressureKPa = pressTag.value as number;
    fcv.outletPressureKPa = Number(((pressTag.value as number) * (fcv.positionPercent / 100)).toFixed(1));

    // 4. Update Trend Data Buffers
    for (const [path, tag] of this.currentTags) {
      const history = this.trendHistories.get(path);
      if (history && typeof tag.value === 'number') {
        history.push({ timestamp: now, value: tag.value });
        if (history.length > this.maxHistoryPoints) {
          history.shift();
        }
      }
    }

    // 5. Automated Limit & Alarm Monitor (ISA-18.2)
    this.checkProcessLimits(now);

    // 6. Notify tag subscribers
    for (const [path, cbs] of this.subscribers) {
      const tag = this.currentTags.get(path);
      if (tag) {
        cbs.forEach((cb) => cb(tag));
      }
    }

    // 7. Notify equipment subscribers
    for (const [path, cbs] of this.motorSubscribers) {
      const motor = this.motors.get(path);
      if (motor) cbs.forEach((cb) => cb({ ...motor }));
    }
    for (const [path, cbs] of this.valveSubscribers) {
      const valve = this.valves.get(path);
      if (valve) cbs.forEach((cb) => cb({ ...valve }));
    }
  }

  private checkProcessLimits(now: number) {
    let alarmStateChanged = false;

    // Check Turbidity alarm
    const turbTag = this.currentTags.get('Plant1/Water/Settling/Turbidity')!;
    const turbVal = turbTag.value as number;
    const turbMeta = this.metadataRegistry.get('Plant1/Water/Settling/Turbidity')!;
    const turbAlarm = this.activeAlarms.find((a) => a.tagPath === turbTag.path);

    if (turbVal > (turbMeta.highHighLimit || 3.0)) {
      if (!turbAlarm || turbAlarm.severity !== 'URGENT') {
        this.raiseAlarm({
          id: 'ALM-TURB-HH',
          tagPath: turbTag.path,
          tagDescription: 'Clarifier Turbidity High-High Urgent Limit',
          area: 'Clarification',
          severity: 'URGENT',
          state: 'UNACK_ALARM',
          condition: `Turbidity exceeded Hi-Hi (${turbVal} > 3.0 NTU)`,
          value: turbVal,
          limit: 3.0,
          timestamp: now,
        });
        alarmStateChanged = true;
      }
    } else if (turbVal > (turbMeta.highLimit || 1.5)) {
      if (!turbAlarm) {
        this.raiseAlarm({
          id: 'ALM-TURB-H',
          tagPath: turbTag.path,
          tagDescription: 'Clarifier Turbidity High Limit Warning',
          area: 'Clarification',
          severity: 'MEDIUM',
          state: 'UNACK_ALARM',
          condition: `Turbidity exceeded Hi (${turbVal} > 1.5 NTU)`,
          value: turbVal,
          limit: 1.5,
          timestamp: now,
        });
        alarmStateChanged = true;
      }
    }

    if (alarmStateChanged) {
      this.notifyAlarms();
    }
  }

  private raiseAlarm(alarm: ActiveAlarm) {
    // Check if already shelved
    const existing = this.activeAlarms.find((a) => a.id === alarm.id);
    if (existing && existing.state === 'SHELVED') return;

    this.activeAlarms = [alarm, ...this.activeAlarms.filter((a) => a.id !== alarm.id)];
    soundService.playAlarmTone(alarm.severity);
    this.notifyAlarms();
  }

  private notifyAlarms() {
    this.alarmSubscribers.forEach((cb) => cb([...this.activeAlarms]));
  }

  // Public API methods
  public subscribeTag(path: string, callback: (tag: TagValue) => void): () => void {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    this.subscribers.get(path)!.add(callback);

    // Initial value push
    const current = this.currentTags.get(path);
    if (current) {
      callback(current);
    }

    return () => {
      const set = this.subscribers.get(path);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.subscribers.delete(path);
      }
    };
  }

  public subscribeMotor(path: string, callback: (motor: MotorTelemetry) => void): () => void {
    if (!this.motorSubscribers.has(path)) {
      this.motorSubscribers.set(path, new Set());
    }
    this.motorSubscribers.get(path)!.add(callback);
    const current = this.motors.get(path);
    if (current) callback({ ...current });

    return () => {
      const set = this.motorSubscribers.get(path);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.motorSubscribers.delete(path);
      }
    };
  }

  public subscribeValve(path: string, callback: (valve: ValveTelemetry) => void): () => void {
    if (!this.valveSubscribers.has(path)) {
      this.valveSubscribers.set(path, new Set());
    }
    this.valveSubscribers.get(path)!.add(callback);
    const current = this.valves.get(path);
    if (current) callback({ ...current });

    return () => {
      const set = this.valveSubscribers.get(path);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.valveSubscribers.delete(path);
      }
    };
  }

  public subscribeAlarms(callback: (alarms: ActiveAlarm[]) => void): () => void {
    this.alarmSubscribers.add(callback);
    callback([...this.activeAlarms]);
    return () => {
      this.alarmSubscribers.delete(callback);
    };
  }

  public getTrendHistory(path: string): TrendDataPoint[] {
    return this.trendHistories.get(path) || [];
  }

  public getTagSnapshot(path: string): TagValue | undefined {
    return this.currentTags.get(path);
  }

  public getMetadata(path: string): TagMetadata | undefined {
    return this.metadataRegistry.get(path);
  }

  public getAllMetadata(): TagMetadata[] {
    return Array.from(this.metadataRegistry.values());
  }

  public getAllMotors(): MotorTelemetry[] {
    return Array.from(this.motors.values());
  }

  public getAllValves(): ValveTelemetry[] {
    return Array.from(this.valves.values());
  }

  // Dispatch Device Commands (Start/Stop/Auto/Manual/Setpoint)
  public executeCommand(command: DeviceCommand): { success: boolean; message: string } {
    soundService.playClick();

    // Check Motor target
    if (this.motors.has(command.targetTag)) {
      const motor = this.motors.get(command.targetTag)!;

      // Interlock safety check
      if (!motor.interlocksOk && (command.command === 'START' || command.command === 'JOG')) {
        return { success: false, message: 'Interlock tripped: Motor cannot be started while interlocks are active.' };
      }

      switch (command.command) {
        case 'START':
          motor.state = 'STARTING';
          setTimeout(() => {
            motor.state = 'RUNNING';
            motor.runFeedback = true;
          }, 800);
          return { success: true, message: `${motor.name} start command issued successfully.` };

        case 'STOP':
          motor.state = 'STOPPING';
          setTimeout(() => {
            motor.state = 'STOPPED';
            motor.runFeedback = false;
          }, 600);
          return { success: true, message: `${motor.name} stop command issued successfully.` };

        case 'JOG':
          motor.state = 'JOGGING';
          motor.currentAmps = 24.5;
          setTimeout(() => {
            motor.state = 'STOPPED';
            motor.currentAmps = 0;
          }, 1500);
          return { success: true, message: `${motor.name} manual jog executed.` };

        case 'SET_AUTO':
          motor.mode = 'AUTO';
          return { success: true, message: `${motor.name} switched to AUTO mode.` };

        case 'SET_MANUAL':
          motor.mode = 'MANUAL';
          return { success: true, message: `${motor.name} switched to MANUAL mode.` };

        case 'SET_SETPOINT':
          if (typeof command.value === 'number') {
            motor.speedSetpoint = command.value;
            return { success: true, message: `Speed setpoint updated to ${command.value} RPM.` };
          }
          break;

        case 'SET_SERVICE':
          motor.inService = Boolean(command.value);
          if (!motor.inService) {
            motor.state = 'OUT_OF_SERVICE';
            motor.runFeedback = false;
          } else {
            motor.state = 'STOPPED';
          }
          return { success: true, message: `Motor ${motor.inService ? 'put IN service' : 'taken OUT of service'}.` };

        case 'RESET_FAULT':
          motor.alarmActive = false;
          motor.faultCode = undefined;
          return { success: true, message: 'Fault successfully cleared.' };
      }
    }

    // Check Valve target
    if (this.valves.has(command.targetTag)) {
      const valve = this.valves.get(command.targetTag)!;
      switch (command.command) {
        case 'OPEN':
          valve.setpointPercent = 100;
          valve.state = 'OPENING';
          return { success: true, message: `${valve.name} OPEN command issued.` };

        case 'CLOSE':
          valve.setpointPercent = 0;
          valve.state = 'CLOSING';
          return { success: true, message: `${valve.name} CLOSE command issued.` };

        case 'SET_SETPOINT':
          if (typeof command.value === 'number') {
            valve.setpointPercent = Math.max(0, Math.min(100, command.value));
            return { success: true, message: `Valve position setpoint set to ${command.value}%.` };
          }
          break;

        case 'SET_AUTO':
          valve.mode = 'AUTO';
          return { success: true, message: `${valve.name} set to AUTO mode.` };

        case 'SET_MANUAL':
          valve.mode = 'MANUAL';
          return { success: true, message: `${valve.name} set to MANUAL mode.` };

        case 'SET_SERVICE':
          valve.inService = Boolean(command.value);
          if (!valve.inService) valve.state = 'OUT_OF_SERVICE';
          return { success: true, message: `Valve ${valve.inService ? 'put IN service' : 'taken OUT of service'}.` };
      }
    }

    // Generic tag write
    if (this.currentTags.has(command.targetTag)) {
      const tag = this.currentTags.get(command.targetTag)!;
      tag.value = command.value as number | string | boolean;
      tag.timestamp = Date.now();
      return { success: true, message: `Tag ${command.targetTag} written successfully.` };
    }

    return { success: false, message: `Unknown target ${command.targetTag}` };
  }

  // Alarm management (Acknowledge, Shelve, Unshelve, Trigger simulated alarm)
  public acknowledgeAlarm(alarmId: string, operator: string = 'OPERATOR') {
    soundService.playClick();
    this.activeAlarms = this.activeAlarms.map((alm) => {
      if (alm.id === alarmId || alarmId === 'ALL') {
        return {
          ...alm,
          state: 'ACK_ALARM',
          acknowledgedAt: Date.now(),
          acknowledgedBy: operator,
        };
      }
      return alm;
    });
    this.notifyAlarms();
  }

  public shelveAlarm(alarmId: string, durationMinutes: number = 30, reason: string = 'Maintenance inspection') {
    soundService.playClick();
    const until = Date.now() + durationMinutes * 60 * 1000;
    this.activeAlarms = this.activeAlarms.map((alm) => {
      if (alm.id === alarmId) {
        return {
          ...alm,
          state: 'SHELVED',
          shelvedUntil: until,
          shelvedReason: reason,
        };
      }
      return alm;
    });
    this.notifyAlarms();
  }

  public unshelveAlarm(alarmId: string) {
    this.activeAlarms = this.activeAlarms.map((alm) => {
      if (alm.id === alarmId) {
        return {
          ...alm,
          state: 'UNACK_ALARM',
          shelvedUntil: undefined,
          shelvedReason: undefined,
        };
      }
      return alm;
    });
    this.notifyAlarms();
  }

  public triggerTestAlarm(severity: AlarmSeverity = 'URGENT') {
    const id = `SIM-${Date.now()}`;
    this.raiseAlarm({
      id,
      tagPath: 'Plant1/Booster/LB01',
      tagDescription: 'LB01 High Vibration Trip Alarm',
      area: 'Distribution Pumping',
      severity,
      state: 'UNACK_ALARM',
      condition: 'Bearing Vibration > 4.5 mm/s',
      value: '4.8 mm/s',
      limit: 4.5,
      timestamp: Date.now(),
    });
  }
}

export const simulationEngine = new SimulationEngine();
