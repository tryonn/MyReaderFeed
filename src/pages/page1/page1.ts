import { Component } from '@angular/core';

import { NavController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Http } from '@angular/http';

import 'rxjs/add/operator/map';

import { InAppBrowser } from 'ionic-native';// para abrir o browser do dispositivo

import { RedditService } from '../../providers/reddit-service';// importando dados para nosso providers


@Component({
  selector: 'page-page1',

  templateUrl: 'page1.html'
})

export class Page1 {

  public feeds: Array<any>;
  
  private url: string = "https://www.reddit.com/new.json";
  private olderPosts: string = "https://www.reddit.com/new.json?after=";
  private newerPosts: string = "https://www.reddit.com/new.json?before=";


  public noFilter: Array<any>;
  public hasFilter: boolean = false;
  public searchTerm: string = '';

  constructor(public redditService: RedditService, public navCtrl: NavController, public http: Http, public loadingCtrl: LoadingController, public actionSheetCtrl: ActionSheetController) {
    this.fetchContent();
  }

  fetchContent():void {
    let loading = this.loadingCtrl.create({
      content: 'Fetching content...'
    });

    loading.present();

  // novo metodo para popula nossa lista de feeds
    this.redditService.fetchData(this.url).then(data => {
      this.feeds = data;
      this.noFilter = this.feeds;
      loading.dismiss();
    });

    /*
      esse foi substituido pelo codigo acima
    this.http.get(this.url).map(res => res.json()).subscribe(data => {


        this.feeds = data.data.children;

        this.feeds.forEach((e, i, a) => {

          console.log(e);
            // TODO corrigir bug referente ao data

            if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1)
            {
              e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
            }
        })

        this.noFilter = this.feeds;

        loading.dismiss();

    });
    */
  }


  itemSelected(url:string):void{
    let browser = new InAppBrowser(url, '_sytem');
  }

  doInfinite(infiniteScroll)
  {
     let paramUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1].data.name : " ";
     //let paramUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1] : " ";

    this.redditService.fetchData(this.olderPosts + paramUrl).then(data => {
      this.feeds = this.feeds.concat(data);
      // removendo filtro
      this.noFilter = this.feeds;
      this.hasFilter = false;

      infiniteScroll.complete();

    });

     /* this.http.get(this.olderPosts + paramUrl).map(res => res.json()).subscribe(data => {

        this.feeds = this.feeds.concat(data.data.children);
        this.feeds.forEach((e, i, a) => {

          console.log(e);
            // TODO corrigir bug referente ao data

            if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1)
            {
              e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
            }
        })


            // removendo filtro
            this.noFilter = this.feeds;
            this.hasFilter = false;

            infiniteScroll.complete();
      });
      */
  }

  doRefresh(refresher)
  {
    let paramUrl = this.feeds[0].data.name;
    //let paramUrl = this.feeds[0];
    //console.log(this.feeds[0].data.name);

    this.redditService.fetchData(this.olderPosts + paramUrl).then(data => {
      this.feeds = data.concat(this.feeds);
      // removendo filtro
    this.noFilter = this.feeds;
    this.hasFilter = false;

    refresher.complete();

    })

   /* this.http.get(this.newerPosts + paramUrl).map(res => res.json()).subscribe(data => {
        this.feeds = data.data.children.concat(this.feeds);
        this.feeds.forEach((e, i, a) => {

          console.log(e);
            // TODO corrigir bug referente ao data

            if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1)
            {
              e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
            }
        })

    });
  
        // removendo filtro
    this.noFilter = this.feeds;
    this.hasFilter = false;

    refresher.complete();
    */


  }

  showFilters():void
  {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Filter options:',
        buttons: [
          {
            text: 'Music',
            handler:() => 
            {
              this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "music");
                this.hasFilter = true;
            }
          },

          {
            text: 'Movies',
              handler: () => 
              {
                this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "movies");
                 this.hasFilter = true; 
              }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => 
            {
              this.feeds = this.noFilter;
              this.hasFilter = false;
            }
          }
        ]
    });

    actionSheet.present();
  }

  // metodo para pesquisa  item na lista
  filterItems(){
    this.hasFilter = false;
    this.feeds = this.noFilter.filter((item) => {
      return item.data.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }

}
