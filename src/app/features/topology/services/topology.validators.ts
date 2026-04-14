import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { timer, switchMap, map, first, of } from 'rxjs';
import { TopologyApiService } from './topology-api.service';
import { NodeType } from '../models/topology.model';

export function uniqueNameValidator(
  api: TopologyApiService,
  currentId: string | null,
  type: NodeType,
  parentId: string | null,
  currentName?: string
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const name = control.value?.trim();
    if (!name) return of(null);
    if (currentName && name.toLowerCase() === currentName.trim().toLowerCase()) return of(null);

    return timer(400).pipe(
      switchMap(() => api.checkNameExists(name, type, parentId, currentId)),
      map(exists => (exists ? { uniqueName: true } : null)),
      first()
    );
  };
}
