import { useEffect } from 'react';

const usePlotlyCleanup = () => {
  useEffect(() => {
    return () => {
      const plotlyElements = document.getElementsByClassName('js-plotly-plot');
      Array.from(plotlyElements).forEach((element) => {
        element.remove();
      });
    };
  }, []);
};

export default usePlotlyCleanup;
