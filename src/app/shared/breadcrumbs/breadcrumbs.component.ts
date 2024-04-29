import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit {

  public titulo: string = '';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof ActivationEnd),
        filter((event: any) => event.snapshot.firstChild === null),
        map((event: ActivationEnd) => event.snapshot.data)
      )
      .subscribe(({ titulo }) => {
        this.titulo = titulo;
        document.title = `Conflictos-${titulo}`;
      })
  }

  ngOnInit(): void {
  }

}
