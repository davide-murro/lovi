import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faBookBookmark, faFileArrowDown } from "@fortawesome/free-solid-svg-icons";


@Component({
  selector: 'app-my-library-container',
  imports: [FontAwesomeModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './my-library-container.html',
  styleUrl: './my-library-container.scss'
})
export class MyLibraryContainer {
  faBookBookmark = faBookBookmark;
  faFileArrowDown = faFileArrowDown;
}
