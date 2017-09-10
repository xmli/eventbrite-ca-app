import { EventbriteCalAppPage } from './app.po';

describe('eventbrite-cal-app App', () => {
  let page: EventbriteCalAppPage;

  beforeEach(() => {
    page = new EventbriteCalAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
