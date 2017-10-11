/**
 * @author Philip Van Raalte
 * @date 2017-08-21.
 */
import React, {Component} from 'react';
import _ from 'lodash';
import {Menu, Segment, Container} from 'semantic-ui-react';
import {Link, withRouter, matchPath} from 'react-router-dom';

class HeaderNav extends Component {
  constructor(props){
    super(props);
    this.state = {activeItem: 'home'};
    this.links = [
      {name: "Home", path: "/", isExact: true},
      {name: "Standings", path: "/standings/", isExact: false},
      {name: "Stats", path: "/stats/", isExact: false}
      ];
  }

  render(){
    return(
      <Segment inverted>
        <Menu inverted pointing secondary size="large">
          <Container>
            <Menu.Item>
              <h3><i>Hockey Sim</i></h3>
            </Menu.Item>
            {
              this.links.map(({name, path, isExact}) => {
                const isMatch = matchPath(this.props.location.pathname, {
                  path,
                  strict: false,
                  isExact
                });
                const active = !_.isNull(isMatch) && (isExact ? isExact === isMatch.isExact : true);
                return(
                <Menu.Item name={name} active={active}>
                  <Link to={path} name={name}>{name}</Link>
                </Menu.Item>
                );
              })
            }
          </Container>
        </Menu>
      </Segment>
    );
  }
}

export default withRouter(HeaderNav);