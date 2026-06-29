import { Pool } from 'pg';
import config from '../config';
import DeviceModel, { Device as DeviceModelType, CreateDeviceInput } from '../models/device.model';

/**
 * Automation trigger types - conditions that can fire automation rules
 */
export type TriggerType = 
  | 'device_status_change'
  | 'energy_threshold'
  | 'time_based'
  | 'manual_activation';

/**
 * Device status change trigger configuration
 */
export interface DeviceStatusTrigger {
  type: 'device_status_change';
  deviceId: number;
  fromStatus?: 'online' | 'offline' | 'error';
  toStatus: 'online' | 'offline' | 'error';
}

/**
 * Energy threshold trigger configuration
 */
export interface EnergyThresholdTrigger {
  type: 'energy_threshold';
  deviceId: number;
  thresholdKwh: number;
  comparison: 'above' | 'below';
  timeWindowMinutes: number;
}

/**
 * Time-based trigger configuration
 */
export interface TimeBasedTrigger {
  type: 'time_based';
  startHour: number;
  endHour: number;
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
}

/**
 * Manual activation trigger (always evaluates to true when activated)
 */
export interface ManualTrigger {
  type: 'manual_activation';
  userId: number;
}

/**
 * Union type for all trigger configurations
 */
export type TriggerConfig = 
  | DeviceStatusTrigger
  | EnergyThresholdTrigger
  | TimeBasedTrigger
  | ManualTrigger;

/**
 * Automation action types - what to do when a trigger fires
 */
export type ActionType = 
  | 'send_notification'
  | 'adjust_device'
  | 'log_event'
  | 'execute_script';

/**
 * Notification action configuration
 */
export interface NotificationAction {
  type: 'send_notification';
  recipients: string[]; // email addresses or user IDs
  messageTemplate: string;
}

/**
 * Device adjustment action configuration
 */
export interface DeviceAdjustmentAction {
  type: 'adjust_device';
  targetDeviceId: number;
  targetStatus?: 'online' | 'offline' | 'error';
  targetValue?: number; // for thermostat-like devices
}

/**
 * Event logging action configuration
 */
export interface LogEventAction {
  type: 'log_event';
  logLevel: 'info' | 'warn' | 'error';
  messageTemplate: string;
  metadata?: Record<string, unknown>;
}

/**
 * Script execution action configuration
 */
export interface ExecuteScriptAction {
  type: 'execute_script';
  scriptId: string;
  parameters?: Record<string, unknown>;
}

/**
 * Union type for all action configurations
 */
export type ActionConfig = 
  | NotificationAction
  | DeviceAdjustmentAction
  | LogEventAction
  | ExecuteScriptAction;

/**
 * Automation rule definition
 */
export interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: TriggerConfig;
  actions: ActionConfig[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Execution result for an automation run
 */
export interface AutomationExecutionResult {
  ruleId: number;
  ruleName: string;
  triggerType: TriggerType;
  triggeredAt: Date;
  actionsExecuted: Array<{
    actionType: ActionType;
    success: boolean;
    result?: unknown;
    error?: string;
  }>;
  status: 'success' | 'partial_failure' | 'failure';
}

/**
 * Evaluation result for a trigger
 */
export interface TriggerEvaluationResult {
  triggered: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * AutomationExecutionService handles evaluation of automation triggers
 * and dispatch of configured actions when rules fire.
 */
class AutomationExecutionService {
  private pool: Pool;
  private readonly executionLogTable = 'automation_executions';

  constructor() {
    this.pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,
      max: config.postgres.maxPoolSize,
      min: config.postgres.minPoolSize,
    });
  }

  /**
   * Evaluate a device status change trigger against current device state.
   */
  private async evaluateDeviceStatusTrigger(
    trigger: DeviceStatusTrigger
  ): Promise<TriggerEvaluationResult> {
    const device = await DeviceModel.findById(trigger.deviceId);

    if (!device) {
      return {
        triggered: false,
        reason: `Device ${trigger.deviceId} not found`,
      };
    }

    // Check if status actually changed to the target status
    const statusChanged = device.status === trigger.toStatus;

    if (statusChanged) {
      return {
        triggered: true,
        reason: `Device ${device.name} status changed to '${trigger.toStatus}'`,
        metadata: {
          deviceId: device.id,
          deviceName: device.name,
          newStatus: device.status,
          previousStatus: trigger.fromStatus || 'unknown',
        },
      };
    }

    return {
      triggered: false,
      reason: `Device ${device.name} status is '${device.status}', not '${trigger.toStatus}'`,
    };
  }

  /**
   * Evaluate an energy threshold trigger against recent device readings.
   */
  private async evaluateEnergyThresholdTrigger(
    trigger: EnergyThresholdTrigger
  ): Promise<TriggerEvaluationResult> {
    // Fetch recent energy readings for the device within the time window
    const now = new Date();
    const windowStart = new Date(now.getTime() - trigger.timeWindowMinutes * 60 * 1000);

    const query = `
      SELECT SUM(consumption_kwh) as total_consumption
      FROM energy_readings
      WHERE device_id = $1
        AND timestamp >= $2
        AND timestamp <= $3
    `;

    const result = await this.pool.query(query, [
      trigger.deviceId,
      windowStart.toISOString(),
      now.toISOString(),
    ]);

    const totalConsumption = parseFloat(result.rows[0]?.total_consumption || '0');

    let triggered = false;
    let reason = '';

    if (trigger.comparison === 'above') {
      triggered = totalConsumption > trigger.thresholdKwh;
      reason = `Energy consumption ${totalConsumption.toFixed(2)} kWh exceeds threshold ${trigger.thresholdKwh} kWh`;
    } else {
      triggered = totalConsumption < trigger.thresholdKwh;
      reason = `Energy consumption ${totalConsumption.toFixed(2)} kWh is below threshold ${trigger.thresholdKwh} kWh`;
    }

    return {
      triggered,
      reason,
      metadata: {
        deviceId: trigger.deviceId,
        totalConsumptionKwh: totalConsumption,
        thresholdKwh: trigger.thresholdKwh,
        timeWindowMinutes: trigger.timeWindowMinutes,
      },
    };
  }

  /**
   * Evaluate a time-based trigger against current time.
   */
  private evaluateTimeBasedTrigger(trigger: TimeBasedTrigger): TriggerEvaluationResult {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    const isWithinHours = hour >= trigger.startHour && hour < trigger.endHour;
    const isOnValidDay = trigger.daysOfWeek.includes(dayOfWeek);

    const triggered = isWithinHours && isOnValidDay;

    return {
      triggered,
      reason: triggered
        ? `Current time ${hour}:00 is within scheduled window (${trigger.startHour}-${trigger.endHour}) on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}`
        : `Current time ${hour}:00 is outside scheduled window or invalid day of week`,
      metadata: {
        currentHour: hour,
        currentDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        startHour: trigger.startHour,
        endHour: trigger.endHour,
        daysOfWeek: trigger.daysOfWeek,
      },
    };
  }

  /**
   * Evaluate a manual activation trigger (always true when activated).
   */
  private evaluateManualTrigger(trigger: ManualTrigger): TriggerEvaluationResult {
    return {
      triggered: true,
      reason: `Manual activation by user ${trigger.userId}`,
      metadata: {
        userId: trigger.userId,
        activatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Evaluate a trigger configuration against current state.
   */
  public async evaluateTrigger(trigger: TriggerConfig): Promise<TriggerEvaluationResult> {
    switch (trigger.type) {
      case 'device_status_change':
        return this.evaluateDeviceStatusTrigger(trigger as DeviceStatusTrigger);
      case 'energy_threshold':
        return this.evaluateEnergyThresholdTrigger(trigger as EnergyThresholdTrigger);
      case 'time_based':
        return this.evaluateTimeBasedTrigger(trigger as TimeBasedTrigger);
      case 'manual_activation':
        return this.evaluateManualTrigger(trigger as ManualTrigger);
      default:
        throw new Error(`Unknown trigger type: ${(trigger as any).type}`);
    }
  }

  /**
   * Execute a notification action.
   */
  private async executeNotificationAction(
    action: NotificationAction,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    try {
      // In production, this would integrate with email service or notification provider
      const message = action.messageTemplate.replace(/{(\w+)}/g, (match, key) => {
        return metadata?.[key as keyof typeof metadata] ?? match;
      });

      console.log(`[Notification] Sending to ${action.recipients.join(', ')}:`, message);

      // Simulate notification sending - replace with actual implementation
      const result = {
        sentTo: action.recipients,
        message: message,
        timestamp: new Date().toISOString(),
      };

      return { success: true, result };
    } catch (error) {
      console.error('[Notification] Failed to send notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute a device adjustment action.
   */
  private async executeDeviceAdjustmentAction(
    action: DeviceAdjustmentAction
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    try {
      const device = await DeviceModel.findById(action.targetDeviceId);

      if (!device) {
        return {
          success: false,
          error: `Target device ${action.targetDeviceId} not found`,
        };
      }

      // Update device status or value based on action configuration
      const updateData: Partial<CreateDeviceInput> = {};

      if (action.targetStatus !== undefined) {
        updateData.status = action.targetStatus;
      }

      if (action.targetValue !== undefined) {
        // For thermostat-like devices, store as metadata
        updateData.metadata = { ...device.metadata, target_value: action.targetValue };
      }

      const updatedDevice = await DeviceModel.update(action.targetDeviceId, updateData);

      return {
        success: true,
        result: {
          deviceId: updatedDevice?.id,
          deviceName: updatedDevice?.name,
          updates: updateData,
        },
      };
    } catch (error) {
      console.error('[DeviceAdjustment] Failed to adjust device:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute an event logging action.
   */
  private async executeLogEventAction(
    action: LogEventAction,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    try {
      const logMessage = action.messageTemplate.replace(/{(\w+)}/g, (match, key) => {
        return metadata?.[key as keyof typeof metadata] ?? match;
      });

      // Log to console with appropriate level
      switch (action.logLevel) {
        case 'error':
          console.error(`[Automation][${action.logLevel.toUpperCase()}] ${logMessage}`);
          break;
        case 'warn':
          console.warn(`[Automation][${action.logLevel.toUpperCase()}] ${logMessage}`);
          break;
        default:
          console.info(`[Automation][${action.logLevel.toUpperCase()}] ${logMessage}`);
      }

      return { success: true, result: { loggedAt: new Date().toISOString() } };
    } catch (error) {
      console.error('[LogEvent] Failed to log event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute a script action.
   */
  private async executeScriptAction(
    action: ExecuteScriptAction
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    try {
      // In production, this would execute stored scripts or call external services
      console.log(`[Script] Executing script ${action.scriptId} with parameters:`, action.parameters);

      // Simulate script execution - replace with actual implementation
      const result = {
        scriptId: action.scriptId,
        executedAt: new Date().toISOString(),
        parameters: action.parameters,
        status: 'completed',
      };

      return { success: true, result };
    } catch (error) {
      console.error('[Script] Failed to execute script:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute all actions configured for an automation rule.
   */
  private async executeActions(
    actions: ActionConfig[],
    metadata?: Record<string, unknown>
  ): Promise<AutomationExecutionResult['actionsExecuted']> {
    const results: AutomationExecutionResult['actionsExecuted'] = [];

    for (const action of actions) {
      let result: { success: boolean; result?: unknown; error?: string };

      switch (action.type) {
        case 'send_notification':
          result = await this.executeNotificationAction(action as NotificationAction, metadata);
          break;
        case 'adjust_device':
          result = await this.executeDeviceAdjustmentAction(action as DeviceAdjustmentAction);
          break;
        case 'log_event':
          result = await this.executeLogEventAction(action as LogEventAction, metadata);
          break;
        case 'execute_script':
          result = await this.executeScriptAction(action as ExecuteScriptAction);
          break;
        default:
          result = {
            success: false,
            error: `Unknown action type: ${(action as any).type}`,
          };
      }

      results.push({
        actionType: action.type,
        success: result.success,
        result: result.result,
        error: result.error,
      });
    }

    return results;
  }

  /**
   * Execute an automation rule by evaluating its trigger and dispatching actions.
   */
  public async executeRule(rule: AutomationRule): Promise<AutomationExecutionResult> {
    // Skip if rule is disabled
    if (!rule.enabled) {
      throw new Error(`Rule ${rule.name} is disabled`);
    }

    // Evaluate the trigger
    const triggerResult = await this.evaluateTrigger(rule.trigger);

    if (!triggerResult.triggered) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggerType: this.getTriggerType(rule.trigger),
        triggeredAt: new Date(),
        actionsExecuted: [],
        status: 'success', // Trigger didn't fire, but evaluation succeeded
      };
    }

    // Execute all actions with the trigger metadata
    const actionsResults = await this.executeActions(rule.actions, triggerResult.metadata);

    // Determine overall execution status
    const hasFailures = actionsResults.some((r) => !r.success);
    const status: AutomationExecutionResult['status'] = hasFailures
      ? 'partial_failure'
      : 'success';

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      triggerType: this.getTriggerType(rule.trigger),
      triggeredAt: new Date(),
      actionsExecuted: actionsResults,
      status,
    };
  }

  /**
   * Get the trigger type from a trigger configuration.
   */
  private getTriggerType(trigger: TriggerConfig): TriggerType {
    switch (trigger.type) {
      case 'device_status_change':
        return 'device_status_change';
      case 'energy_threshold':
        return 'energy_threshold';
      case 'time_based':
        return 'time_based';
      case 'manual_activation':
        return 'manual_activation';
      default:
        throw new Error(`Unknown trigger type: ${(trigger as any).type}`);
    }
  }

  /**
   * Log an automation execution to the database.
   */
  private async logExecution(
    ruleId: number,
    result: AutomationExecutionResult
  ): Promise<void> {
    const query = `
      INSERT INTO ${this.executionLogTable} (
        rule_id,
        trigger_type,
        triggered_at,
        status,
        actions_executed_count,
        success_count,
        failure_count,
        error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const successCount = result.actionsExecuted.filter((a) => a.success).length;
    const failureCount = result.actionsExecuted.filter((a) => !a.success).length;

    await this.pool.query(query, [
      ruleId,
      result.triggerType,
      result.triggeredAt.toISOString(),
      result.status,
      result.actionsExecuted.length,
      successCount,
      failureCount,
      result.status === 'partial_failure' ? 'Some actions failed' : null,
    ]);
  }

  /**
   * Public method to execute a rule and log the result.
   */
  public async executeRuleWithLogging(rule: AutomationRule): Promise<AutomationExecutionResult> {
    const result = await this.executeRule(rule);
    await this.logExecution(rule.id, result);
    return result;
  }
}

export default new AutomationExecutionService();
