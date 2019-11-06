/**
 * @author Philip Van Raalte
 * @date 2017-08-23.
 */
import React, { Component } from "react";
import { Button, Icon, Grid, Segment, Label } from "semantic-ui-react";
import _ from "lodash";

import BigCalendar from "react-big-calendar";
import moment from "moment";
BigCalendar.momentLocalizer(moment);

class MyCalendar extends Component {
  render() {
    const CustomToolbar = toolbar => {
      const goToBack = () => {
        toolbar.date.setMonth(toolbar.date.getMonth() - 1);
        toolbar.onNavigate("prev");
      };

      const goToNext = () => {
        toolbar.date.setMonth(toolbar.date.getMonth() + 1);
        toolbar.onNavigate("next");
      };

      const goToCurrent = () => {
        const now = new Date();
        toolbar.date.setMonth(now.getMonth());
        toolbar.date.setYear(now.getFullYear());
        toolbar.onNavigate("current");
      };

      const label = () => {
        const date = moment(toolbar.date);
        return (
          <Label ribbon="left" size="large" color="blue">
            {date.format("MMMM - YYYY")}
          </Label>
        );
      };

      return (
        <Segment className="no-border">
          {label()}
          <Grid>
            <Grid.Column
              floated="right"
              width={4}
              className="margin-vertical-negative-30"
              style={{
                paddingRight: 0
              }}
            >
              <Button.Group
                className="bottom-padding"
                style={{
                  float: "right"
                }}
              >
                <Button animated="left" onClick={goToBack} color="vk">
                  <Button.Content visible>
                    <Icon name="left arrow" />
                  </Button.Content>
                  <Button.Content hidden>Prev.</Button.Content>
                </Button>
                <Button animated="fade" onClick={goToCurrent} color="vk">
                  <Button.Content visible>
                    <Icon name="calendar" />
                  </Button.Content>
                  <Button.Content hidden>Today</Button.Content>
                </Button>
                <Button animated="right" onClick={goToNext} color="vk">
                  <Button.Content visible>
                    <Icon name="right arrow" />
                  </Button.Content>
                  <Button.Content hidden>Next</Button.Content>
                </Button>
              </Button.Group>
            </Grid.Column>
          </Grid>
        </Segment>
      );
    };

    return (
      <BigCalendar
        {...this.props}
        selectable
        popup
        style={
          // will not display without height
          {
            height: 500
          }
        }
        components={{
          toolbar: CustomToolbar
        }}
        views={{ month: true }}
      />
    );
  }
}

export default MyCalendar;
