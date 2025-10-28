import { Component, inject } from '@angular/core';
import { PodcastsService } from '../../core/services/podcasts.service';
import { ToasterService } from '../../core/services/toaster.service';
import { DialogService } from '../../core/services/dialog.service';
import { AudioBooksPaged } from "../../shared/audio-books-paged/audio-books-paged";
import { PodcastsPaged } from "../../shared/podcasts-paged/podcasts-paged";

@Component({
  selector: 'app-home',
  imports: [AudioBooksPaged, PodcastsPaged],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
}
