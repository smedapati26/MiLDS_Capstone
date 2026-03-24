import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';

import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

/**
 * Safely renders text content with HTML line breaks converted to React elements
 * @param content - The text content that may contain <br /> or <br> tags
 * @returns Array of React elements with proper line breaks
 */
const renderSafeContent = (content: string): React.ReactNode[] => {
  // Split content by <br /> or <br> tags (case insensitive)
  const parts = content.split(/<br\s*\/?>/gi);

  return parts.map((part, index) => (
    <React.Fragment key={generateUniqueId()}>
      {part.trim()}
      {index < parts.length - 1 && <br />}
    </React.Fragment>
  ));
};

const UnOrderedList: React.FC<{ list: string[] }> = ({ list }: { list: string[] }): JSX.Element => {
  return (
    <ul style={{ paddingLeft: '20px' }} data-testid="parts-failure-predictive-model-list">
      {list.map((item) => (
        <li key={generateUniqueId()}>
          <Typography variant="body1">{item}</Typography>
        </li>
      ))}
    </ul>
  );
};

interface IParagraph {
  title: string;
  body: string;
  list?: string[];
}

const Paragraph: React.FC<IParagraph> = ({ title, body, list }: IParagraph): JSX.Element => {
  return (
    <Box data-testid="parts-failure-predictive-model-paragraph">
      <Typography variant="body2" sx={{ mb: '8px' }}>
        {title}
      </Typography>
      <Typography variant="body1">{renderSafeContent(body)}</Typography>
      {list && <UnOrderedList list={list} />}
    </Box>
  );
};

interface Props {
  open: boolean;
  handleClose: () => void;
}

/**
 * Modal to for Expected Failures Learn More
 *
 * @component
 * @param props - props for component
 * @param props.open - boolean for open state of dialog
 * @param props.handleClose - functions to close dialog
 * @return JSX.Element
 */

const ExpectedFailureModal: React.FC<Props> = ({ open, handleClose }: Props): JSX.Element => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        sx={{ maxHeight: '700px', overflow: 'scroll', mt: '80px' }}
        data-testid="parts-failure-predictive-model-dialog"
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="body2">
              Parts Failure Predictive Model
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing="20px">
            <Paragraph
              title="Model details"
              body="Survival models predict the probability of failure events over a range of future flight hours for
                installed, tracked parts on four rotary wing aircraft systems: UH-60, AH-64, UH-72, and CH-47. Models
                are built using an adaption of a random forest for survival data, random survival forest (RSF) from the
                scikit-survival package. Different RSF models are created for each combination of aircraft system and
                work unit code, e.g., main transmission (06A). Scikit-survival has a GPL-3 license"
            />
            <Paragraph
              title="Intended Use"
              body="Model outputs can be used in several ways:"
              list={[
                'Estimate the likelihood of failure of specific parts over the next t hours. We do this for t=5 to 100.',
                'Aggregate likelihood of failure to the aircraft to identify aircraft most likely to fail',
                'Aggregate likelihood of failure of a WUC to the unit level to estimate number of failures by part type',
                'Compare the reliability of parts by different parameters, such as part number or unit',
              ]}
            />
            <Paragraph
              title="Factors"
              body="The models use four category variables and thirteen numeric variables to help distinguish survival 
							behavior."
              list={[
                'Category parameters: CAGE code, part number, install maintenance level (depot or field), and unit command',
                `Numeric parameters: previous AVIM repair count, previous depot repair count, previous part number (PN) change count, 
									flight hours since last intermediate maintenance (AVIM) repair, flight hours since last deport repair, flight hours since 
									last PN change, calendar days since last AVIM repair, days since last depot repair, and days since last PN change`,
              ]}
            />
            <Paragraph
              title="Metics"
              body="We evaluate models using concordance index (CI), a discriminatory metric between 0 and 1 that measures how well a 
							model discriminates, or distinguishes, parts based on their likelihood to fail. If the model correctly ranks parts in 
							order of their times to failure compared to reality then the CI is 1. A CI of 0.50 is similar to ranking by random guessing. 
							Scores under 0.50 are possible, and show that the model is worse than random."
            />
            <Paragraph
              title="Training Data"
              body="Survival models are trained and evaluated on lifetime interval data - time that an object is on test between two events. 
							The first, earlier, event is a part install in our case, and the time that separates the event is both calendar time and flight time. 
							The second, later, event is either the event of interest - removal that leads to an overhaul - or a censoring - when something interrupts 
							the lifetime before it gets to the event, like scheduled maintenance or the end of data because part is still installed. Our training data 
							size depends on the system and WUC, but can vary from a few data points to a several tens of thousands. Some WUCs have up to thirty years 
							of lifetime intervals.<br /><br />
							Interval data is constructed from transaction maintenance data, primarily install and removal events. Lifetime intervals that do not accrue 
							any time is not included in training data, and categorical data that only has one level is similarly excluded. Otherwise, categorical data 
							is one-hot encoded and nulls in numeric data are replaced with zero before training. We use at most 500 trees to fit each model, the square 
							root of the total number of features as the number to consider when selecting the best feature to use to split a node, and require at least 
							10% of the training data in each leaf node."
            />
            <Paragraph
              title="Evaluation Data"
              body="Evaluation data is a subset of the training data. Because the RSF model is a tree-based model, the implementation allows evaluating a 
							metric on out-of-bag (OOB) data. This OOB data is unseen by the trees used in the scoring, but because the data is resampled, the same data 
							point will be used for both training and evaluation in different trees. In that way this method is similar to cross-validation."
            />
            <Paragraph
              title="Quantitative Analyses"
              body="OOB CI for a recent versions of the model (14 April 2025) across all system and WUCs have a mean of 0.554 and a median of 0.579."
            />
            <Paragraph
              title="Ethical Considerations"
              body="Input data and predictions relate to maintenance and probabilities of aircraft. This data is CUI, and does not contain PII. Misusing 
							data or predictions may cause more work and cost than is necessary, but will not imperil personal data or be biased against humans."
            />
            <Paragraph
              title="Caveats and Recommendations"
              body="Models generally perform well for WUCs with a good amount of training data; roughly 50 causal failures. Models fit on low-population 
							WUCs perform less well, and should be reviewed before using their forecasts.  Additionally, models with CI below 0.5 may not provide 
							good estimates.<br /><br />
							We don't make predictions for parts that are not installed, so if an aircraft is in phase at the time we build predictions then we will 
							likely not make predictions for some important parts, such as all four main rotor blades."
            />
          </Stack>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default ExpectedFailureModal;
