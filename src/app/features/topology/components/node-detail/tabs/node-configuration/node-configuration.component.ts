import { Component, inject, effect, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap, of, take } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../../../../core/services/toast.service';
import { TopologyApiService } from '../../../../services/topology-api.service';
import { TopologyTreeActionsService } from '../../../../services/topology-tree-actions.service';
import { NodeConfig, NodeDetail, NodeType, UpdateNodeConfig } from '../../../../models/topology.model';
import { uniqueNameValidator } from '../../../../services/topology.validators';
import { FieldDef, GroupDef, GROUPS, TYPE_GROUPS } from './node-configuration.config';

@Component({
  selector: 'app-node-configuration',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatIconModule],
  templateUrl: './node-configuration.component.html',
  styleUrl: './node-configuration.component.scss',
})
export class NodeConfigurationComponent {
  private route = inject(ActivatedRoute);
  private topologyApi = inject(TopologyApiService);
  private treeActions = inject(TopologyTreeActionsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  isPasswordHidden = signal(true);
  isSaving = signal(false);
  private readonly allFieldDefs = Object.values(GROUPS).flatMap(g => g.fields);
  private readonly nodeId$ = this.route.parent!.paramMap.pipe(
    map(params => params.get('nodeId')),
    distinctUntilChanged(),
  );

  // get selected node general details
  selectedNode = toSignal(
    this.nodeId$.pipe(
      switchMap(nodeId => nodeId ? this.topologyApi.getNodeDetail(nodeId) : of(null))
    )
  );

  // get selected node config details
  nodeConfig = toSignal(
    this.nodeId$.pipe(
      switchMap(nodeId => nodeId ? this.topologyApi.getNodeConfig(nodeId) : of(null))
    )
  );

  // get group configs for current node type (used to render form sections in template)
  activeGroups = computed<GroupDef[]>(() => {
    const nodeType = this.selectedNode()?.type;
    if (!nodeType) return [];
    return (TYPE_GROUPS[nodeType] ?? ['general']).map(key => GROUPS[key]).filter(Boolean);
  });

  form = this.fb.group({
    // general
    name: ['', this.getValidatorsFor('name')],
    location: ['', this.getValidatorsFor('location')],

    // hardware
    vendorId: ['', this.getValidatorsFor('vendorId')],
    serialNumber: ['', this.getValidatorsFor('serialNumber')],
    firmware: ['', this.getValidatorsFor('firmware')],

    // security
    password: ['', this.getValidatorsFor('password')],
    registrationId: ['', this.getValidatorsFor('registrationId')],

    ipAddress: ['', this.getValidatorsFor('ipAddress')],
    macAddress: ['', this.getValidatorsFor('macAddress')],
  });

  private readonly readonlyFieldKeys = this.allFieldDefs
    .filter(f => f.readonly)
    .map(f => f.key);

  constructor() {
    this.readonlyFieldKeys.forEach(key => this.form.get(key)?.disable());

    effect(() => {
      const selectedNode = this.selectedNode();
      this.syncEnabledControls(selectedNode);
      this.form.patchValue(this.toFormValue(selectedNode, this.nodeConfig()));
      this.form.markAsPristine();

      // update name validator whenever selected node changes, so uniqueness is checked in the correct scope
      const nameControl = this.form.get('name');
      const nameFieldDef = this.getFieldDef('name');
      if (selectedNode && nameControl && nameFieldDef?.asyncValidator === 'uniqueName') {
        nameControl.setAsyncValidators(uniqueNameValidator(
          this.topologyApi,
          selectedNode.id,
          selectedNode.type,
          selectedNode.parentId ?? null,
          selectedNode.name,
        ));
        nameControl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  isFieldVisible(field: FieldDef): boolean {
    if (!field.onlyFor) return true;
    return field.onlyFor.includes(this.selectedNode()?.type as NodeType);
  }

  togglePassword(): void {
    this.isPasswordHidden.update(hidden => !hidden);
  }

  resetConfig(): void {
    this.form.patchValue(this.toFormValue(this.selectedNode(), this.nodeConfig()));
  }

  saveConfig(): void {
    const selectedNode = this.selectedNode();
    if (!selectedNode) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValues = this.form.value;

    const payload: UpdateNodeConfig = {
      name: formValues.name ?? undefined,
      location: formValues.location ?? undefined,
      password: formValues.password ?? undefined,
      registrationId: formValues.registrationId ?? undefined,
      ipAddress: formValues.ipAddress ?? undefined,
    };

    this.isSaving.set(true);
    this.topologyApi.updateNodeConfig(selectedNode.id, payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          if (payload.name && payload.name !== selectedNode.name) {
            this.treeActions.rename(selectedNode.id, payload.name);
          }
          this.toast.success('Configuration saved');
        },
        error: () => this.toast.error('Could not save configuration'),
        complete: () => this.isSaving.set(false),
      });
  }

  private syncEnabledControls(selectedNode: NodeDetail | null | undefined): void {
    const visibleKeys = new Set(
      selectedNode
        ? this.activeGroups()
            .flatMap(group => group.fields)
            .filter(field => this.isFieldVisible(field))
            .map(field => field.key)
        : []
    );
    const readonlyFieldKeys = new Set(this.readonlyFieldKeys);

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (!control) return;

      const shouldEnable = visibleKeys.has(key) && !readonlyFieldKeys.has(key);
      if (shouldEnable && control.disabled) {
        control.enable({ emitEvent: false });
      } else if (!shouldEnable && control.enabled) {
        control.disable({ emitEvent: false });
      }
    });
  }

  private getFieldDef(key: string): FieldDef | undefined {
    return this.allFieldDefs.find(field => field.key === key);
  }

  private getValidatorsFor(key: string) {
    return this.getFieldDef(key)?.validators ?? [];
  }

  // combines both endpoints data into a single form value object
  private toFormValue(selectedNode: NodeDetail | null | undefined, nodeConfig: NodeConfig | null | undefined) {
    return {
      name:           selectedNode?.name               ?? '',
      location:       selectedNode?.location           ?? '',
      vendorId:       selectedNode?.vendor             ?? '',
      serialNumber:   selectedNode?.serialNumber       ?? '',
      firmware:       selectedNode?.hardware?.firmware ?? '',
      ipAddress:      selectedNode?.ipAddress          ?? '',
      password:       nodeConfig?.password             ?? '',
      registrationId: nodeConfig?.registrationId       ?? '',
      macAddress:     nodeConfig?.macAddress           ?? '',
    };
  }
}
