import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeepDiveResponse } from '../../models/deep-dive.models';
import { ActivityHeatmapComponent } from './sections/activity-heatmap.component';
import { HourlyWeekdayHeatmapComponent } from './sections/hourly-weekday-heatmap.component';
import { WatchTrendsComponent } from './sections/watch-trends.component';
import { DurationDistributionComponent } from './sections/duration-distribution.component';
import { TagCloudComponent } from './sections/tag-cloud.component';
import { ChannelDiversityComponent } from './sections/channel-diversity.component';

@Component({
  selector: 'app-deep-dive',
  standalone: true,
  imports: [
    CommonModule,
    ActivityHeatmapComponent,
    HourlyWeekdayHeatmapComponent,
    WatchTrendsComponent,
    DurationDistributionComponent,
    TagCloudComponent,
    ChannelDiversityComponent,
  ],
  template: `
    <div class="deep-dive">
      <app-activity-heatmap [data]="data.activity_heatmap"></app-activity-heatmap>

      <div class="section-light">
        <app-hourly-weekday-heatmap [data]="data.hourly_weekday_heatmap"></app-hourly-weekday-heatmap>
      </div>

      <app-watch-trends [data]="data.watch_trends"></app-watch-trends>

      <div class="section-light">
        <app-duration-distribution [data]="data.duration_distribution"></app-duration-distribution>
      </div>

      <app-tag-cloud [data]="data.tag_cloud"></app-tag-cloud>

      <div class="section-light">
        <app-channel-diversity [data]="data.channel_diversity"></app-channel-diversity>
      </div>
    </div>
  `,
  styles: [`
    .deep-dive {
      width: 100%;
    }
    .section-light {
      background: var(--bg);
    }
  `],
})
export class DeepDiveContainerComponent {
  @Input() data!: DeepDiveResponse;
}
