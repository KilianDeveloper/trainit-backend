import { checkProperties } from "../utils/validator";
import { BaseEntity } from "./BaseEntity";

export enum MeasurementUnit{
    KILOGRAM = "kg",
    POUND = "lbs",
    SECOND = "s",
    MINUTE = "min",
    METER = "m",
    CENTIMETER = "cm",
    PERCENT = "p"
}

export const valueToUnit = (v: number,  from: MeasurementUnit, to: MeasurementUnit) => {
    if (from === to) {
      return v;
    } else if (from === MeasurementUnit.KILOGRAM && to === MeasurementUnit.POUND) {
      return v * 2.205;
    } else if (from === MeasurementUnit.POUND && to === MeasurementUnit.KILOGRAM) {
      return v / 2.205;
    } else if (from === MeasurementUnit.SECOND && to === MeasurementUnit.MINUTE) {
      return v / 60;
    } else if (from === MeasurementUnit.MINUTE && to === MeasurementUnit.SECOND) {
      return v * 60;
    } else if (from === MeasurementUnit.METER && to === MeasurementUnit.CENTIMETER) {
      return v * 1000;
    } else if (from === MeasurementUnit.CENTIMETER && to === MeasurementUnit.METER) {
      return v / 1000;
    } else {
      return null;
    }
  }

export class PersonalRecord implements BaseEntity {
    name: string

    value: string

    isFavorite: boolean

    unit: MeasurementUnit

    date: Date

    constructor() {
      this.name = "";
      this.value = "";
      this.date = new Date();
      this.unit = MeasurementUnit.KILOGRAM;
      this.isFavorite = false;
  }

  static readonly NAME_MAX_LENGTH = 50;
    static readonly NAME_MIN_LENGTH = 1;
    static readonly VALUE_MAX = 100000;
    static readonly VALUE_MIN = 0;
    static readonly FAVORITE_MAX = 2;



  static isValid(value: any) {
      const pr = new PersonalRecord();
      checkProperties(value, pr)
      return true;
  }


    public hashableString(){
        return this.name + this.value + this.isFavorite.toString() + this.date.toString() + this.unit.toString()
    }

}