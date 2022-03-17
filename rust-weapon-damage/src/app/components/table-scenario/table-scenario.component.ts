import { Component, ComponentRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'tr[app-table-scenario]',
  templateUrl: './table-scenario.component.html',
  styleUrls: ['./table-scenario.component.css']
})
export class TableScenarioComponent implements OnInit {
  @Input() protection: number = 0;
  @Input() health: number = 100;
  @Input() guns: any[] = [];
  @Input() option!: string;
  @Input() scenarioType!: string;
  _ref!: ComponentRef<TableScenarioComponent>;
  desc: boolean = false;
  minMax: { min: number, max: number} = { min: 0, max: 0};

  onClose() {
    this._ref.destroy();
  }

  faMinusCircle = faMinusCircle;

  setScenarioType(scenarioType: string) {
    if (scenarioType != this.scenarioType)
      this.protection *= scenarioType == "Distance" ? 0.01 : 100;

    this.scenarioType = scenarioType;
  }

  constructor() { 
  }

  ngOnInit(): void {
    this.update();
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

  calcDamage(g: any): number {
    return this.scenarioType == "Protection" 
      ? 
      Math.min(
        Math.max(                       // distance //
          g['damageCalculated']*(1-((this.protection-g.minRange)*(0.2/(g.maxRange-g.minRange)))),
          (1-0.2)*g['damageCalculated']
        ),
        g['damageCalculated']
      )
      : g['damageCalculated'] * (1-this.protection);
  }

  update() {
    //console.log("Update for " + (this.scenarioType == "Distance" ? this.protection*100+"%" : this.protection+"m"));
    switch(this.option) {
      case "Damage":
        this.guns.forEach(g =>g[this.protection+"%"] = this.calcDamage(g));
        break;
      case "Damage per Clip":
        this.guns.forEach(g =>g[this.protection+"%"] = this.calcDamage(g) * 30);
        break;
      case "TTK (ms)":
        this.guns.forEach(g => g[this.protection+"%"] = this.calcDamage(g));
        this.guns.forEach(g => g[this.protection+"%"] = (this.health/g[this.protection+"%"]-1) * g.firerate);
        this.guns.forEach(g => g[this.protection+"%"] = Math.ceil(g[this.protection+"%"]/g.firerate) * g.firerate);
        break;
      case "Shots to Kill":
        this.guns.forEach(g =>g[this.protection+"%"] = Math.ceil(this.health/(this.calcDamage(g))));
        break;
      default:
        console.log("Unknown option: ", this.option);
        break;
    }
    this.minMax = this.guns.reduce((prev,curr) => {
      var min = curr[this.protection+"%"] < prev.min ? curr[this.protection+"%"] : prev.min;
      var max = curr[this.protection+"%"] > prev.max ? curr[this.protection+"%"] : prev.max;
      return { min: min, max: max };
    },{ min: Infinity, max: 0 });
  }

  sort(field: string) {
    this.desc ? this.guns.sort((a,b) => b[field] - a[field]) : this.guns.sort((a,b) => a[field] - b[field]);
    this.desc = !this.desc;
  }

}
