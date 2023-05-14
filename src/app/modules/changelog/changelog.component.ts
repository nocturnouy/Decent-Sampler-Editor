import { Component } from '@angular/core';


@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent {
 
  codeUrl = 'https://raw.githubusercontent.com/nocturnouy/Decent-Sampler-Editor/main/CHANGELOG.md'

}
