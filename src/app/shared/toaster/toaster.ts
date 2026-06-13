import { Component, inject } from '@angular/core';
import { ToasterService } from '../../core/services/toaster.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toaster',
  imports: [FontAwesomeModule],
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss'
})
export class Toaster {
  toasterService = inject(ToasterService);

  faClose = faClose;
}
