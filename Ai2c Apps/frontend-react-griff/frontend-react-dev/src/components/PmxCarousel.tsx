import React, { ReactNode, useEffect, useState } from 'react';
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, IconButton, Stack } from '@mui/material';

import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

export interface PmxCarouselProps {
  children?: ReactNode | ReactNode[];
  maxVisible?: number | undefined;
  style?: React.CSSProperties;
  slideGap?: number;
}

interface SwiperButtonProps {
  buttonRef?: EmblaCarouselType | undefined; // Define the type for swiperRef
  disabled?: boolean;
}

const NextButton = ({ buttonRef, disabled = false }: SwiperButtonProps): React.ReactNode => {
  const scrollNext = () => {
    if (!buttonRef) return;
    const lastIndex = buttonRef?.scrollSnapList().length - 1;
    if (buttonRef.selectedScrollSnap() === lastIndex) {
      buttonRef.scrollTo(0);
    } else {
      buttonRef.scrollNext();
    }
  };

  return (
    <IconButton disabled={disabled} onClick={scrollNext} size={'large'}>
      <ArrowForwardIosIcon />
    </IconButton>
  );
};

const PrevButton = ({ buttonRef, disabled = false }: SwiperButtonProps) => {
  const scrollPrev = () => {
    if (!buttonRef) return;
    const firstIndex = 0;
    if (buttonRef.selectedScrollSnap() === firstIndex) {
      buttonRef.scrollTo(buttonRef?.scrollSnapList().length - 1);
    } else {
      buttonRef.scrollPrev();
    }
  };
  return (
    <IconButton disabled={disabled} onClick={scrollPrev} size={'large'}>
      <ArrowBackIosIcon />
    </IconButton>
  );
};

/**
 * Lightweight carousel component that can show children as carousel or row list of nodes
 * @param {PmxCarouselProps} props component props
 * @param {ReactNode | ReactNode[]} props.children children to show in carousel
 * @param {number | undefined} props.maxVisible max number of child component to show in carousel
 * @param {React.CSSProperties} props.style optional style added to actual carousel component, not control buttons
 * @param {number} props.slidGap space between slides
 *
 * @returns node carousel component
 */

const PmxCarousel: React.FC<PmxCarouselProps> = ({
  children,
  maxVisible,
  style,
  slideGap = 12,
}: PmxCarouselProps): React.ReactNode => {
  const childrenArray = React.Children.toArray(children);
  const options: EmblaOptionsType = {
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: false, // <-- To have reset effect
  };
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [canScroll, setCanScroll] = useState(true);

  // Update canScroll when emblaApi changes or re-initializes
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      // If either direction can scroll, show buttons
      setCanScroll(emblaApi.canScrollNext() || emblaApi.canScrollPrev());
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect(); // Initial check

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  if (maxVisible && childrenArray.length <= maxVisible) {
    return (
      <Stack
        direction={'row'}
        sx={{
          alignItems: 'center',
        }}
        spacing={3}
        data-testid="pmx-non-carousel"
      >
        {children}
      </Stack>
    );
  }

  const showButtons = maxVisible !== undefined || canScroll;

  return (
    <Stack direction="row" alignItems="center" spacing={3} data-testid="pmx-carousel">
      {showButtons && <PrevButton buttonRef={emblaApi} disabled={false} />}
      <Box ref={emblaRef} sx={{ overflow: 'hidden', width: '100%', ...style }} className="embla">
        <Box sx={{ display: 'flex' }} className="embla__container">
          {childrenArray.map((child, index) => (
            <Box
              key={`slide-${generateUniqueId()}-${index}`}
              sx={{
                ...(maxVisible !== undefined && {
                  flex: `0 0 calc(${100 / maxVisible}% - ${(slideGap * (maxVisible - 1)) / maxVisible}px)`,
                }),
                mr: 3,
              }}
              className="embla__slide"
            >
              {child}
            </Box>
          ))}
        </Box>
      </Box>
      {showButtons && <NextButton buttonRef={emblaApi} disabled={false} />}
    </Stack>
  );
};

export default PmxCarousel;
