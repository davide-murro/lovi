import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthDirective } from "../../core/directives/auth.directive";
import { RolesTablePaged } from '../../shared/auth/roles-table-paged/roles-table-paged';
import { UsersTablePaged } from '../../shared/auth/users-table-paged/users-table-paged';
import { BooksTablePaged } from "../../shared/books-table-paged/books-table-paged";
import { PodcastsTablePaged } from "../../shared/podcasts-table-paged/podcasts-table-paged";
import { CreatorsTablePaged } from "../../shared/creators-table-paged/creators-table-paged";

@Component({
  selector: 'app-edit',
  imports: [FontAwesomeModule, AuthDirective, UsersTablePaged, RolesTablePaged, BooksTablePaged, PodcastsTablePaged, CreatorsTablePaged],
  templateUrl: './edit.html',
  styleUrl: './edit.scss'
})
export class Edit {
}
