/**
 * Prizes Tooltip Component.
 *
 * USAGE:
 * Wrap with <PrizesTooltip></PrizesTooltip> tags the element(s) which should
 * show the tooltip when hovered. Pass in the challenge details object via the
 * 'challenge' prop.
 */

import React, { PropTypes as PT } from 'react'
import Tooltip from '../Tooltip';
import './PrizesTooltip.scss';

const ID_LENGTH = 6
const BASE_URL = 'https://api.topcoder.com/v2';
const CHALLENGES_API = `${BASE_URL}/challenges/`;
const V2_API = 'https://api.topcoder.com/v2';
/**
 * A single bonus componenent.
 * It renders the bonus name inside a colored rectangle,
 * and the bonus number, formatted as currency, next to it.
 */
function Bonus(props) {
  return (
    <div className="bonus">
      <span className="bonus-name">{props.bonusName}</span>
      ${props.bonus.toLocaleString()}
    </div>
  );
}

Bonus.propTypes = {
  bonusName: PT.string.isRequired,
  bonus: PT.number.isRequired,
};

/**
 * A single prise component.
 * It renders a round-shaped medal with the specified place number inside it,
 * and the prize, formatted as currency, next to it.
 */
function Prize(props) {
  return (
    <div className="prize">
      <span className={`medal place-${props.place}`}>{props.place}</span>
      ${props.prize.toLocaleString()}
    </div>
  );
}

Prize.propTypes = {
  place: PT.number.isRequired,
  prize: PT.number.isRequired,
};

/**
 * Tooltip content.
 * It renders the list of prizes (using the Prize component), and, if reliability
 * bonus is associated with the challenge, it also renders it (using the Bonus component).
 */
function Tip(props) {
  let prizes;
  if (props.challenge.prize) {
    prizes = props.challenge.prize.map((prize, index) => {
      const place = 1 + index;
      return <Prize key={place} place={place} prize={prize} />;
    });
  }
  let bonuses;
  if (props.challenge && props.challenge.reliabilityBonus) {
    bonuses = (
      <div className="bonuses">
        <h1>Bonuses</h1>
        <Bonus bonus={props.challenge.reliabilityBonus} bonusName="Reliability" />
      </div>
    );
  }
  return (
    <div>
      <div>
        <h1>Prizes</h1>
        {prizes}
      </div>
      {bonuses}
    </div>
  );
}

Tip.propTypes = {
  challenge: PT.shape({
    prize: PT.array,
    reliabilityBonus: PT.number,
  }).isRequired,
};

/**
 * Renders the tooltip.
 */

class PrizesTooltip extends React.Component {
  constructor(props) {
    super(props);
    const that = this;
    this.state = {
      chDetails: {}
    }
    this.onTooltipHover = this.onTooltipHover.bind(this)
  }
  onTooltipHover() {
    const that = this;
    console.log('hovered')
    let chClone = _.clone(this.props.challenge);
    this.fetchChallengeDetails(chClone.challengeId).then(details => {
      let chId = chClone.challengeId + ''
      if(chId.length < ID_LENGTH) {
          details.postingDate = chClone.startDate
          details.registrationEndDate = chClone.endDate
          details.submissionEndDate = chClone.endDate
          details.appealsEndDate = chClone.endDate
        }
      that.setState({chDetails: details})
    });
  }
  // It fetches detailed challenge data and attaches them to the 'details'
  // field of each challenge object.
  fetchChallengeDetails = (id) => {
    const challengeId = '' + id // change to string
    if(challengeId.length < ID_LENGTH) {
      console.log(`${V2_API}/data/marathon/challenges/${id} : called`)
      return fetch(`${V2_API}/data/marathon/challenges/${id}`).then(res => res.json());
    } else {
      console.log(`${CHALLENGES_API}${id} : called`)
      return fetch(`${CHALLENGES_API}${id}`).then(res => res.json());
    }
  }
  render() {
    const tip = <Tip challenge={this.state.chDetails} />;
    return (
      <Tooltip className="prizes-tooltip" content={tip} onTooltipHover={this.onTooltipHover}>
        {this.props.children}
      </Tooltip>
    );
  }
}

PrizesTooltip.defaultProps = {
  challenge: {
    prize: [],
  },
};

PrizesTooltip.propTypes = {
  challenge: PT.shape({
    prize: PT.array,
    reliabilityBonus: PT.number,
  }),
  children: PT.node.isRequired,
};

export default PrizesTooltip;
