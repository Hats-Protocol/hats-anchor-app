import _ from 'lodash';
import { HatWearer } from 'types';
import { formatAddress } from 'utils';

interface OrgChartWearer {
  address: string;
  content: string;
  contentWidth: string;
  accent: string;
  accentWidth: string;
  color: string;
  icon: string;
}

// eslint-disable-next-line import/prefer-default-export
export const selectedOptionContent = ({
  selectedOption,
  currentSupply,
  maxSupply,
  hatChartWearers,
  levelAtLocalTree,
  extendedToggle,
  extendedEligibility,
}: {
  selectedOption: string | undefined;
  currentSupply: string;
  maxSupply: string;
  hatChartWearers: OrgChartWearer;
  levelAtLocalTree: number;
  extendedToggle: HatWearer | undefined;
  extendedEligibility: HatWearer | undefined;
}) => {
  let toggleText = extendedToggle && formatAddress(extendedToggle?.id);
  if (levelAtLocalTree === 0) {
    toggleText = 'None - Top Hat';
  } else if (!extendedToggle) {
    toggleText = 'None Set';
  } else if (extendedToggle?.ensName && extendedToggle?.ensName !== '') {
    toggleText = extendedToggle?.ensName;
  }

  let eligibilityText =
    extendedEligibility && formatAddress(extendedEligibility?.id);
  if (levelAtLocalTree === 0) {
    eligibilityText = 'None - Top Hat';
  } else if (!extendedEligibility) {
    eligibilityText = 'None Set';
  } else if (
    extendedEligibility?.ensName &&
    extendedEligibility?.ensName !== ''
  ) {
    eligibilityText = extendedEligibility?.ensName;
  }

  switch (selectedOption) {
    case 'wearers':
      // handle "group" hats
      if (_.isEqual(_.toNumber(maxSupply), 0)) {
        return `
            <div style="
              margin-top: 68px;
              width: 100%;
              height: 40px;
              border-top: 1px solid #4A5568;
              padding: 10px;
              background: rgba(196, 241, 249, 0.2);
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
            ">
              <div style="
                display: flex;
                flex-direction: row;
                gap: 2px;
              ">
                <div style="min-width: 16px;" />
                <div style="
                  display: -webkit-box;
                  font-size: 15px;
                  font-style: italic;
                  font-weight: 400;
                  opacity: 0.6;
                ">
                  Group
                </div>
              </div>
            </div>
          `;
      }
      return `
          <div style="
            margin-top: 68px;
            width: 100%;
            height: 40px;
            border-top: 1px solid #4A5568;
            padding: 10px;
            background: ${hatChartWearers?.color};
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="
              display: flex;
              flex-direction: row;
              gap: 2px;
            ">
              <div style="min-width: 16px;">
                ${hatChartWearers?.icon || ''}
              </div>
              <div style="
                display: -webkit-box;
                font-size: 15px;
                font-weight: ${
                  _.toNumber(currentSupply) > 0 ? 'bold' : 'medium'
                };
                opacity: 0.8;
                overflow: hidden;
                width: ${hatChartWearers?.contentWidth};
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
              ">
                ${hatChartWearers?.content}
              </div>
            </div>
            ${
              hatChartWearers?.accent
                ? `<div style="
                    display: inline-block;
                    fit-content: contain;
                    text-align: right;
                    min-width: ${hatChartWearers?.accentWidth};
                    opacity: 0.6;
                  ">
                    ${hatChartWearers?.accent}
                  </div>`
                : ''
            }
          </div>`;
    case 'permissions':
      return `
          <div style="
          margin-top: 68px;
          width: 100%;
          height: 40px;
          border-top: 1px solid #4A5568;
          padding: 10px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="
            display: flex;
            flex-direction: row;
            gap: 4px;
          ">
            Test
          </div>
        </div>`;
    case 'authorities':
      return ``;

    case 'toggle':
      return `
          <div style="
            margin-top: 68px;
            width: 100%;
            height: 40px;
            border-top: 1px solid #4A5568;
            padding: 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="
              display: flex;
              flex-direction: row;
              gap: 4px;
            ">
              <div style="min-width: 16px;">
                <img src="/icons/toggle.svg" alt="toggle" />
              </div>
              <div style="
                display: inline-block;
                font-size: 15px;
                font-weight: 550;
                opacity: 0.8;
              ">
                ${toggleText}
              </div>
            </div>
          </div>`;

    case 'eligibility':
      return `
          <div style="
            margin-top: 68px;
            width: 100%;
            height: 40px;
            border-top: 1px solid #4A5568;
            padding: 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="
              display: flex;
              flex-direction: row;
              gap: 4px;
            ">
              <div style="min-width: 16px;">
                <img src="/icons/eligibility.svg" alt="toggle" />
              </div>
              <div style="
                display: inline-block;
                font-size: 15px;
                font-weight: 550;
                opacity: 0.8;
              ">
                ${eligibilityText}
              </div>
            </div>
          </div>
        `;

    default:
      return '';
  }
};
