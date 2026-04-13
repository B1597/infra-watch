import { ValidatorFn, Validators } from '@angular/forms';
import { NodeType } from '../../../../models/topology.model';

export interface FieldDef {
  key:        string;
  label:      string;
  inputType?: 'text' | 'password' | 'number';
  readonly?:  boolean;
  validators?: ValidatorFn[];
  asyncValidator?: 'uniqueName';
  errors?:    Record<string, string>;
  onlyFor?:   NodeType[];
}

export interface GroupDef {
  key:      string;
  title:    string;
  subtitle: string;
  fields:   FieldDef[];
}

// group definitions
export const GROUPS: Record<string, GroupDef> = {
  general: {
    key:      'general',
    title:    'General',
    subtitle: 'Basic identification and location',
    fields: [
      {
        key: 'name',
        label: 'Name',
        validators: [Validators.required],
        asyncValidator: 'uniqueName',
        errors: { required: 'Name is required', uniqueName: 'A node with this name already exists' },
      },
      {
        key: 'location',
        label: 'Location',
        validators: [Validators.required],
        onlyFor: ['datacenter', 'rack'],
      },
    ],
  },
  hardware: {
    key:      'hardware',
    title:    'Hardware',
    subtitle: 'Hardware and firmware details',
    fields: [
      { key: 'vendorId',     label: 'Vendor',        readonly: true },
      { key: 'serialNumber', label: 'Serial Number', readonly: true },
      { key: 'firmware',     label: 'Firmware',      readonly: true },
    ],
  },
  security: {
    key:      'security',
    title:    'Security',
    subtitle: 'Access credentials and registration',
    fields: [
      {
        key: 'password',
        label: 'Password',
        inputType: 'password',
        validators: [Validators.required, Validators.minLength(8)],
        errors: { required: 'Password is required', minlength: 'Password must be at least 8 characters' },
      },
      {
        key: 'registrationId',
        label: 'Registration ID',
        validators: [Validators.required],
        onlyFor: ['datacenter'],
      },
    ],
  },
  network: {
    key:      'network',
    title:    'Network',
    subtitle: 'Connection and addressing',
    fields: [
      {
        key: 'ipAddress',
        label: 'IP Address',
        validators: [Validators.pattern(/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/)],
        errors: { pattern: 'Enter a valid IPv4 address (e.g. 192.168.1.1)' },
      },
      {
        key: 'macAddress',
        label: 'MAC Address',
        validators: [Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)],
        errors: { pattern: 'Enter a valid MAC address (e.g. 00:1A:2B:3C:4D:5E)' },
        onlyFor: ['server', 'switch', 'router', 'storage'],
      },
    ],
  },
};

// which groups each node type shows
export const TYPE_GROUPS: Partial<Record<NodeType, string[]>> = {
  datacenter: ['general', 'security'],
  rack:       ['general', 'hardware'],
  server:     ['general', 'hardware', 'security', 'network'],
  switch:     ['general', 'hardware', 'security', 'network'],
  router:     ['general', 'hardware', 'security', 'network'],
  storage:    ['general', 'hardware', 'security', 'network'],
  vm:         ['general', 'security', 'network'],
  service:    ['general', 'network'],
};
