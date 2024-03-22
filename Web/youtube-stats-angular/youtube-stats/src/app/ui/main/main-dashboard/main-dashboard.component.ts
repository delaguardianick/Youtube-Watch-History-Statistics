import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-main-dashboard',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: `./main-dashboard.component.html`,
    styleUrl: './main-dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDashboardComponent { }
