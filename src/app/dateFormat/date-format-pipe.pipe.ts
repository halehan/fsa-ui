import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormatPipe'
})

export class DateFormatPipe extends DatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    console.log(value);

    return super.transform(value, 'MM/dd/yyyy', '+0430');
  }

}
