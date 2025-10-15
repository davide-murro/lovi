import { Type } from "@angular/core";
import { DialogConfig } from "./dialog-config.model";

export interface DialogState {
    component: Type<any> | null;
    config?: DialogConfig;
    visible: boolean;
}