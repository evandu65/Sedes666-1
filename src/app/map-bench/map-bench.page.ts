import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";

import { latLng, MapOptions, tileLayer, marker, Marker, Map } from "leaflet";

import { defaultIcon } from "../icon/default-marker";

import { Bench } from "../models/bench";
import { BenchPage } from "../models/benchPage";
import { Coordinate } from "../models/coordinate";
import { Location } from "../models/location";

@Component({ selector: "app-map-bench", templateUrl: "./map-bench.page.html", styleUrls: ["./map-bench.page.scss"] })
export class MapBenchPage implements OnInit {
  mapOptions: MapOptions;

  mapMarkers: Marker[];

  benches: Bench[];

  locations: Location[];

  coordinates: Coordinate[];

  constructor(private geolocation: Geolocation, private auth: AuthService, private router: Router, public http: HttpClient) {
    this.mapOptions = {
      layers: [tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 })],
      zoom: 9,
      center: latLng(46.778186, 6.641524)
    };
  }

  onMapReady(map: Map) {
    setTimeout(() => map.invalidateSize(), 0);
  }

  ngOnInit() {
    this.geolocation.getCurrentPosition().then((position: Geoposition) => {
      const coords = position.coords;
      console.log(`User is at ${coords.longitude}, ${coords.latitude}`);
      this.mapOptions.center = latLng(coords.latitude, coords.longitude);
    }).catch(err => {
      console.warn(`Could not retrieve user position because: ${err.message}`);
    });
    const trackingSubscription = this.geolocation.watchPosition().subscribe({
      next: (position: Geoposition) => {
        const coords = position.coords;
        console.log(`User is at ${coords.longitude}, ${coords.latitude}`);
        
      },
      error: err => {
        console.warn(`Could not retrieve user position because: ${err.message}`);
      }
    });

    this.ionViewDidLoad();
  }


  ionViewDidLoad() {
    const benchesUrl = `${environment.apiUrl}/benches`;
    this.http.get<BenchPage>(benchesUrl).subscribe(result => {
      console.log(`Benches loaded`, result);
      this.benches = result.data;
      this.locations = this.benches.map(bench => bench.location);
      this.coordinates = this.locations.map(location => location.coordinates);
      this.mapMarkers = [];

      for (let bench of this.benches) {
        let lon = bench.location.coordinates[0];
        let lat = bench.location.coordinates[1];
        this.mapMarkers.push(marker([
          lon, lat
        ], { icon: defaultIcon }).bindPopup(`${bench.description}, <a href="/bench/${bench._id}">Voir le banc</a>`));
      }

      // for (let c of this.coordinates) {
      //   let lon = c[0];
      //   console.log(lon);
      //   let lat = c[1];
      //   this.mapMarkers.push(marker([
      //     lon, lat
      //   ], {icon: defaultIcon}).bindTooltip(`${c}`),);
      // }
    });
  }

  logOut() {
    console.log("logging out...");
    this.auth.logOut();
    this.router.navigateByUrl("/login");
  }

  getCoordinates() { }
}
