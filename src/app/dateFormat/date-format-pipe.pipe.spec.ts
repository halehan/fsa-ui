import { DateFormatPipe } from './date-format-pipe.pipe';

describe('DateFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new DateFormatPipe('mm/dd/yyyy');
    expect(pipe).toBeTruthy();
  });
});
