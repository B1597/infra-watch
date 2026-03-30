import { inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { timer, switchMap, map, first, of } from 'rxjs';
import { TopologyApiService } from './topology-api.service';
import { NodeType } from '../models/topology.model';

/**
 * TEMPORARY: Client-side uniqueness validation using all nodes.
 * This should be replaced with a backend API call (checkNameExists)
 */
export function uniqueNameValidator(
  api: TopologyApiService,
  currentId: string | null,
  type: NodeType,
  parentId: string | null
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const name = control.value?.trim().toLowerCase();
    if (!name) return of(null);

    return timer(400).pipe(
      switchMap(() => api.getAllNodes()),
      map(nodes => {
        const duplicate = Object.values(nodes).some(
          node =>
            node.id !== currentId &&
            node.type === type &&
            node.parentId === parentId &&
            node.name.toLowerCase() === name
        );
        return duplicate ? { uniqueName: true } : null;
      }),
      first()
    );
  };
}
