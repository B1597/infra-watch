import { Component, inject, effect, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TopologySelectionService } from '../../../../services/topology-selection.service';
import { TopologyApiService } from '../../../../services/topology-api.service';
import { NodeConfig, NodeDetail, NodeType } from '../../../../models/topology.model';
import { uniqueNameValidator } from '../../../../services/topology.validators';
import { FieldDef, GroupDef, GROUPS, TYPE_GROUPS } from './node-configuration.config';

@Component({
  selector: 'app-node-configuration',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule],
  templateUrl: './node-configuration.component.html',
  styleUrl: './node-configuration.component.scss',
})
export class NodeConfigurationComponent {
  private selectionService = inject(TopologySelectionService);
  private topologyApi      = inject(TopologyApiService);
  private fb               = inject(FormBuilder);

  hidePassword = signal(true);

  // GET /nodes/:id — monitoring data (name, type, hardware, stats…)
  node = toSignal(
    toObservable(this.selectionService.selection).pipe(
      switchMap(sel => sel ? this.topologyApi.getNodeDetail(sel.id) : of(null))
    )
  );

  // GET /nodes/:id/config — editable config (password, registrationId, macAddress)
  config = toSignal(
    toObservable(this.selectionService.selection).pipe(
      switchMap(sel => sel ? this.topologyApi.getNodeConfig(sel.id) : of(null))
    )
  );

  // get group configs for current node type (used to render form sections in template)
  activeGroups = computed<GroupDef[]>(() => {
    const nodeType = this.node()?.type;
    if (!nodeType) return [];
    return (TYPE_GROUPS[nodeType] ?? ['general']).map(key => GROUPS[key]).filter(Boolean);
  });

  form = this.fb.group({
    // general
    name: ['', Validators.required],
    location: ['', Validators.required],

    // hardware
    vendorId: [''],
    serialNumber: [''],
    firmware: [''],

    // security
    password: ['', [Validators.required, Validators.minLength(8)]],
    registrationId: ['', Validators.required],

    ipAddress: ['', Validators.pattern(/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/)],
    macAddress: ['', Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)],
  });

  // collect readonly field keys once from the group definitions
  private readonly readonlyKeys = Object.values(GROUPS)
    .flatMap(g => g.fields)
    .filter(f => f.readonly)
    .map(f => f.key);

  constructor() {
    // disable read-only controls
    this.readonlyKeys.forEach(key => this.form.get(key)?.disable());

    effect(() => {
      const node = this.node();
      this.form.patchValue(this.buildFormValue(node, this.config()));

      // update name validator whenever selected node changes, so uniqueness is checked in the correct scope
      const nameCtrl = this.form.get('name');
      if (node && nameCtrl) {
        nameCtrl.setAsyncValidators(uniqueNameValidator(this.topologyApi, node.id, node.type, node.parentId ?? null));
        nameCtrl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  isFieldVisible(field: FieldDef): boolean {
    if (!field.onlyFor) return true;
    return field.onlyFor.includes(this.node()?.type as NodeType);
  }

  togglePassword(): void {
    this.hidePassword.update(v => !v);
  }

  reset(): void {
    this.form.patchValue(this.buildFormValue(this.node(), this.config()));
  }

  save(): void {
    console.log(this.form.value);
  }

  // combines both endpoints into a single form value object
  private buildFormValue(node: NodeDetail | null | undefined, config: NodeConfig | null | undefined) {
    return {
      name:           node?.name               ?? '',
      location:       node?.location           ?? '',
      vendorId:       node?.vendor             ?? '',
      serialNumber:   node?.serialNumber       ?? '',
      firmware:       node?.hardware?.firmware ?? '',
      ipAddress:      node?.ipAddress          ?? '',
      password:       config?.password         ?? '',
      registrationId: config?.registrationId   ?? '',
      macAddress:     config?.macAddress       ?? '',
    };
  }
}
