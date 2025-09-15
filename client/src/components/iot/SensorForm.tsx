import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { iotService } from '@/services/iot.service';
import { SensorType, IoTSensor } from '@/types/iot';

const sensorFormSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  name: z.string().min(1, 'Sensor name is required'),
  type: z.nativeEnum(SensorType, {
    errorMap: () => ({ message: 'Please select a sensor type' }),
  }),
  location: z.string().min(1, 'Location is required'),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  unit: z.string().optional(),
  alertsEnabled: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.minThreshold !== undefined && data.maxThreshold !== undefined) {
      return data.minThreshold < data.maxThreshold;
    }
    return true;
  },
  {
    message: 'Minimum threshold must be less than maximum threshold',
    path: ['maxThreshold'],
  }
);

type SensorFormData = z.infer<typeof sensorFormSchema>;

interface SensorFormProps {
  farmId: string;
  sensor?: IoTSensor;
  onClose: () => void;
  onSuccess: () => void;
}

export const SensorForm: React.FC<SensorFormProps> = ({
  farmId,
  sensor,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!sensor;
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<SensorFormData>({
    resolver: zodResolver(sensorFormSchema),
    defaultValues: {
      deviceId: sensor?.deviceId || '',
      name: sensor?.name || '',
      type: sensor?.type || SensorType.TEMPERATURE,
      location: sensor?.location || '',
      minThreshold: sensor?.configuration?.minThreshold,
      maxThreshold: sensor?.configuration?.maxThreshold,
      unit: sensor?.configuration?.unit || getDefaultUnit(sensor?.type || SensorType.TEMPERATURE),
      alertsEnabled: sensor?.configuration?.alertsEnabled || false,
    },
  });

  // Get default unit for sensor type
  function getDefaultUnit(type: SensorType): string {
    const units: Record<SensorType, string> = {
      [SensorType.TEMPERATURE]: '°C',
      [SensorType.HUMIDITY]: '%',
      [SensorType.SOIL_MOISTURE]: '%',
      [SensorType.PH]: 'pH',
      [SensorType.LIGHT]: 'lux',
      [SensorType.PRESSURE]: 'hPa',
      [SensorType.WIND_SPEED]: 'm/s',
      [SensorType.RAINFALL]: 'mm',
      [SensorType.CO2]: 'ppm',
      [SensorType.AMMONIA]: 'ppm',
      [SensorType.ELECTRICAL_CONDUCTIVITY]: 'mS/cm',
    };
    return units[type] || '';
  }

  // Update unit when sensor type changes
  const selectedType = form.watch('type');
  React.useEffect(() => {
    if (!isEditing) {
      form.setValue('unit', getDefaultUnit(selectedType));
    }
  }, [selectedType, form, isEditing]);

  // Create sensor mutation
  const createSensorMutation = useMutation({
    mutationFn: (data: SensorFormData) =>
      iotService.createSensor({
        farmId,
        deviceId: data.deviceId,
        name: data.name,
        type: data.type,
        location: data.location,
        configuration: {
          minThreshold: data.minThreshold,
          maxThreshold: data.maxThreshold,
          unit: data.unit,
          alertsEnabled: data.alertsEnabled,
        },
      }),
    onSuccess: () => {
      toast.success('Sensor created successfully');
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create sensor');
    },
  });

  // Update sensor mutation
  const updateSensorMutation = useMutation({
    mutationFn: (data: SensorFormData) =>
      iotService.updateSensor(sensor!.id, {
        name: data.name,
        location: data.location,
        configuration: {
          minThreshold: data.minThreshold,
          maxThreshold: data.maxThreshold,
          unit: data.unit,
          alertsEnabled: data.alertsEnabled,
        },
      }),
    onSuccess: () => {
      toast.success('Sensor updated successfully');
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update sensor');
    },
  });

  const isLoading = createSensorMutation.isPending || updateSensorMutation.isPending;

  const onSubmit = (data: SensorFormData) => {
    if (isEditing) {
      updateSensorMutation.mutate(data);
    } else {
      createSensorMutation.mutate(data);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 150); // Allow animation to complete
  };

  // Sensor type options
  const sensorTypeOptions = [
    { value: SensorType.TEMPERATURE, label: 'Temperature' },
    { value: SensorType.HUMIDITY, label: 'Humidity' },
    { value: SensorType.SOIL_MOISTURE, label: 'Soil Moisture' },
    { value: SensorType.PH, label: 'pH Level' },
    { value: SensorType.LIGHT, label: 'Light Intensity' },
    { value: SensorType.PRESSURE, label: 'Pressure' },
    { value: SensorType.WIND_SPEED, label: 'Wind Speed' },
    { value: SensorType.RAINFALL, label: 'Rainfall' },
    { value: SensorType.CO2, label: 'CO2 Level' },
    { value: SensorType.AMMONIA, label: 'Ammonia Level' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Sensor' : 'Add New Sensor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the sensor configuration and settings.'
              : 'Configure a new IoT sensor for your farm monitoring system.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Device ID */}
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., TEMP_001, HUM_002"
                      disabled={isEditing} // Can't change device ID when editing
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the physical sensor device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sensor Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sensor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Greenhouse Temperature" {...field} />
                  </FormControl>
                  <FormDescription>
                    Descriptive name for easy identification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sensor Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sensor Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditing} // Can't change type when editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sensor type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sensorTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Type of measurement this sensor provides
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Greenhouse A, Field 1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Physical location where the sensor is installed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., °C, %, pH" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unit of measurement for sensor readings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thresholds */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Min value"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Max value"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Alerts Enabled */}
            <FormField
              control={form.control}
              name="alertsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Alerts</FormLabel>
                    <FormDescription>
                      Send notifications when readings exceed thresholds
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Sensor' : 'Create Sensor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};