/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Industrial SCADA / HMI Type Definitions
 * Aligned with ANSI/ISA-101.01-2015 and ANSI/ISA-18.2-2016 standards.
 */

export type TagQuality = 'GOOD' | 'BAD' | 'UNCERTAIN' | 'COMM_FAILURE';

export type AlarmSeverity = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlarmState = 'UNACK_ALARM' | 'ACK_ALARM' | 'UNACK_CLEAR' | 'CLEARED' | 'SHELVED';

export type DeviceMode = 'AUTO' | 'MANUAL' | 'LOCAL' | 'REMOTE' | 'MAINTENANCE';

export type MotorState =
  | 'STOPPED'
  | 'STARTING'
  | 'RUNNING'
  | 'STOPPING'
  | 'JOGGING'
  | 'FAULT'
  | 'OUT_OF_SERVICE';

export type ValveState =
  | 'CLOSED'
  | 'OPENING'
  | 'OPEN'
  | 'CLOSING'
  | 'STOPPED'
  | 'FAULT'
  | 'OUT_OF_SERVICE';

export interface TagMetadata {
  path: string;
  name: string;
  description: string;
  area: string;
  unit: string;
  datatype: 'float' | 'int' | 'boolean' | 'string';
  engineeringUnits: string;
  format?: string;
  euMin: number;
  euMax: number;
  normalMin: number;
  normalMax: number;
  lowLowLimit?: number;
  lowLimit?: number;
  highLimit?: number;
  highHighLimit?: number;
}

export interface TagValue<T = number | boolean | string> {
  path: string;
  value: T;
  timestamp: number;
  quality: TagQuality;
  setpoint?: number;
  rateOfChange?: number;
}

export interface ActiveAlarm {
  id: string;
  tagPath: string;
  tagDescription: string;
  area: string;
  severity: AlarmSeverity;
  state: AlarmState;
  condition: string; // e.g. 'PV High-High Alarm', 'Motor Trip Fail'
  value: number | string;
  limit?: number;
  timestamp: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  shelvedUntil?: number;
  shelvedReason?: string;
}

export interface MotorTelemetry {
  tagPath: string;
  name: string;
  state: MotorState;
  mode: DeviceMode;
  inService: boolean;
  interlocksOk: boolean;
  permissivesOk: boolean;
  runFeedback: boolean;
  currentAmps: number;
  ratedAmps: number;
  speedRpm: number;
  speedSetpoint: number;
  vibrationMmS: number;
  windingTempC: number;
  runningHours: number;
  faultCode?: string;
  alarmActive: boolean;
  alarmSeverity?: AlarmSeverity;
  alarmAcknowledged?: boolean;
}

export interface ValveTelemetry {
  tagPath: string;
  name: string;
  state: ValveState;
  mode: DeviceMode;
  inService: boolean;
  isModulating: boolean;
  positionPercent: number; // 0 - 100%
  setpointPercent: number; // 0 - 100%
  openFeedback: boolean;
  closedFeedback: boolean;
  travelTimeSec: number;
  inletPressureKPa: number;
  outletPressureKPa: number;
  faultCode?: string;
  alarmActive: boolean;
  alarmSeverity?: AlarmSeverity;
  alarmAcknowledged?: boolean;
}

export interface TagWriteCommand {
  tagPath: string;
  value: unknown;
  timestamp: number;
  operatorId?: string;
}

export interface DeviceCommand {
  targetTag: string;
  command: 'START' | 'STOP' | 'JOG' | 'OPEN' | 'CLOSE' | 'SET_AUTO' | 'SET_MANUAL' | 'SET_SETPOINT' | 'RESET_FAULT' | 'SET_SERVICE';
  value?: number | boolean;
  operator: string;
  reason?: string;
}

/**
 * ANSI/ISA-101 & ISA-18.2 Compliant Color Palette Definitions
 * Derived directly from Rockwell Automation Process HMI Style Guide (PROCES-WP023A-EN-P)
 */
export const ISA_COLORS = {
  // Displays & Panels
  displayBg: '#E0E0E0',
  tabPanelBg: '#E0E0E0',
  displayBgBehindTabs: '#C0C0C0',
  groupingBox: '#E8E8E8',
  equipmentBorder: '#A0A0A4',
  processLinePrimary: '#A0A0A4',
  separatorLine: '#D8D8D8',
  
  // Static Typography
  textDarkGray: '#3F3F3F',
  textUnitGray: '#919191',
  
  // Live Dynamic Data
  dynamicDataText: '#475CA7', // Cool industrial blue for live values
  
  // Equipment Dynamic States
  stateOffStopped: '#808080', // Gray 128
  stateOnRunning: '#F0F0F0',   // Off-white 240
  stateTransition: '#93C2E4', // Light blue (Starting/Stopping/Opening/Closing)
  stateManualJog: '#93C2E4',
  
  // ANSI/ISA-18.2 Alarm Severity Codes
  alarmUrgent: '#E22028', // Priority 1 Red
  alarmHigh: '#EC8629',   // Priority 2 Orange
  alarmMedium: '#F5E11B', // Priority 3 Yellow
  alarmLow: '#916AAD',    // Priority 4 Magenta
  alarmProgramError: '#000000', // Fault / Bad Config Black
} as const;
