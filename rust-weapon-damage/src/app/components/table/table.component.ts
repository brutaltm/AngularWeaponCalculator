import { AfterViewInit, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Gun } from '../../Gun'
import { ApiService } from '../../services/api.service'
import { TableScenarioComponent } from '../table-scenario/table-scenario.component';
import { faMinusCircle, faTintSlash } from '@fortawesome/free-solid-svg-icons'
import * as $ from 'jquery';
//declare var $: any;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, AfterViewInit {
  faMinusCircle = faMinusCircle;

  guns: any[] = [];
  gunsLeft: any[] = [];
  props: any[] = ["name","firerate","dmg","minRange","maxRange"];
  distance: number =  30;
  headshot: boolean = false;
  health: number = 100;
  option: string = "TTK (ms)";
  selectValue: number = 0;
  gunSelectValue: number = -1;
  gunIndex: number = -1;
  array: number[] = Array(20);
  scenarios: ComponentRef<TableScenarioComponent>[] = [];  
  scenarioTypes: string[] = ["Protection", "Distance"];
  scenarioType: string = "Distance";
  options: string[] = ["Damage","Damage per Clip","TTK (ms)","Shots to Kill"];
  desc: boolean = false;

  @ViewChild('placeholder', { read: ViewContainerRef }) placeholder!: ViewContainerRef;

  constructor(public viewContainerRef: ViewContainerRef, private apiService: ApiService) {
    this.viewContainerRef = viewContainerRef;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.guns.length > 0 || this.gunsLeft.length > 0) {
        this.addScenario(0);
        this.addScenario(25);
        this.addScenario(40);
        this.addScenario(50);
        this.onDistanceChanged();
      }
    },1);
  }
  
  ngOnInit(): void {
    this.guns = this.apiService.guns;
    this.gunsLeft = this.apiService.gunsLeft;
    if (this.guns.length == 0 && this.gunsLeft.length == 0) {
      this.apiService.getGuns().subscribe(guns => {
        this.apiService.guns = guns;
        this.apiService.gunsLeft = this.gunsLeft;
        this.guns = this.apiService.guns;
        this.gunsLeft = this.apiService.gunsLeft;
        this.gunsLeft.splice(0,0,...this.guns.splice(4,this.guns.length-4));
        //this.guns = guns;
        //this.props = Object.keys(this.guns[0]).filter(k => k != 'id');
        this.addScenario(0);
        this.addScenario(25);
        this.addScenario(40);
        this.addScenario(50);
        this.onDistanceChanged();
      });
    }

    // $(document).ready(() => {
    //   $('td').mouseover(function () {
    //     //$(this).siblings().css('background-color', '#323539');
    //     var ind = $(this).index();
    //     $('td:nth-child(' + (ind + 1) + ')').css('background-color', '#323539');
    //   });
    //   $('td').mouseleave(function () {
    //     //$(this).siblings().css('background-color', '');
    //     var ind = $(this).index();
    //     $('td:nth-child(' + (ind + 1) + ')').css('background-color', '');
    //   });
    // });
  }

  onDistanceChanged() {
    switch (this.scenarioType) {
      case "Distance": 
        this.guns.forEach(g => g['damageCalculated'] = this.calcDamageWithDistance(g));
        break;
      case "Protection": 
        this.guns.forEach(g => g['damageCalculated'] = g.dmg * (+this.headshot+1) * (1-this.distance/100));
        break;
      default:
        console.log("Unknown scenario type.");
        break
    }
    
    this.scenarios.forEach(s => s.instance.update());
  }

  calcDamageWithDistance(g :Gun): number {
    return Math.min(
        Math.max(
          g.dmg*(+this.headshot+1)*(1-((this.distance-g.minRange)*(0.2/(g.maxRange-g.minRange)))),
          (1-0.2)*g.dmg*(+this.headshot+1)
        ),
        g.dmg*(+this.headshot+1)
      );
  }

  onHeadshotChanged() {
    this.guns.forEach(g => g['damageCalculated'] *= (this.headshot ? 2 : 0.5));
    this.scenarios.forEach(s => s.instance.update());
  }

  onHealthChanged() {
    this.scenarios.forEach(s => s.instance.health = this.health);
    this.scenarios.forEach(s => s.instance.update());
  }

  onOptionChanged() {
    this.scenarios.forEach(s => s.instance.option = this.option);
    this.scenarios.forEach(s => s.instance.update());
  }

  onScenarioTypeChanged() {
    this.onDistanceChanged();
    this.scenarios.forEach(s => s.instance.setScenarioType(this.scenarioType));
    this.scenarios.forEach(s => s.instance.update());
  }

  addScenario(protection: number) {
    if (this.scenarios.find(s => s.instance.protection == protection/100))
      return;
    var comp = this.placeholder.createComponent(TableScenarioComponent);
    comp.instance.protection = this.scenarioType == "Distance" ? protection/100 : protection;
    comp.instance.guns = this.guns;
    comp.instance.option = this.option;
    comp.instance.health = this.health;
    comp.instance.scenarioType = this.scenarioType;
    comp.instance._ref = comp;
    comp.onDestroy(() => this.scenarios.splice(this.scenarios.indexOf(comp),1));
    this.scenarios.push(comp);

    var i = this.scenarios.length-1;
    while(i > 0 && comp.instance.protection < this.scenarios[i-1].instance.protection) {
      i--;
    }    
    if (i != this.scenarios.length-1) {
      this.placeholder.move(comp.hostView,i);
      this.scenarios.splice(i,0,this.scenarios.splice(this.scenarios.length-1,1)[0]);
    }
  }

  addGun(index: number) {
    if (index == -1) return;
    this.guns.push(...this.gunsLeft.splice(index,1));
    this.onDistanceChanged();
    this.scenarios.forEach(s => s.instance.update());
    this.gunSelectValue = this.gunsLeft.length-1;
  }

  removeGun(name: string) {
    this.gunsLeft.push(...this.guns.splice(this.guns.findIndex(g => g.name == name),1));
    this.gunSelectValue = this.gunsLeft.length-1;
  }

  sort(field: string) {
    this.desc ? this.guns.sort((a,b) => b[field] - a[field]) : this.guns.sort((a,b) => a[field] - b[field]);
    this.desc = !this.desc;
  }

  onMouseDown(gun :Gun) {
    this.gunIndex = this.guns.indexOf(gun);
    $('td:nth-child('+ (this.gunIndex+2) +')')
      .css("color","gold");
  }

  onMouseUp(gun: Gun) {
    var index = this.guns.indexOf(gun);
    if (this.gunIndex != -1 && index != this.gunIndex) {
      this.guns.splice(index,0,...this.guns.splice(this.gunIndex,1));
    }
    $('td:nth-child('+ (this.gunIndex+2) +')')
      .css("color","white");
    this.gunIndex = -1;
  }

}
