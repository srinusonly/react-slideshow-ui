// @flow
import * as React from 'react';
import styles from './styles';
import Preview from './Preview';
import FullscreenIcon from './FullscreenIcon';
import FullscreenButton from './FullscreenButton';
import Viewer from './Viewer';
import ProgressBar from './ProgressBar';
import PagingButton from './PagingButton';
import shallowEqualObject from './shallow-equal-object';
import toggleFullscreen from 'toggle-fullscreen';

const fullscreenChange = toggleFullscreen.fullscreenChange;
const isFullscreen = toggleFullscreen.isFullscreen;

/**
 * This class named SlideShow is the React component that allows you
 * to develop slideshow like 'SlideShare' or 'SpeakerDeck' very easy!
 * @class
 */
export default class SlideShow extends React.Component<Props, State> {
  state: State;
  props: Props;
  timestamp: number;
  static defaultProps: Object;

  /**
   * constructor
   * call super constructor and initialize states.
   * @param {Props} props
   */
  constructor(props: Props) {
    super(props);

    this.timestamp = 0;
    if (props.withTimestamp === true) {
      this.timestamp = Math.floor(new Date().getTime() / 1000);
    }

    if (this.props.style) {
      for (const key in this.props.style) {
        if (this.props.style.hasOwnProperty(key)) {
          styles.ROOT[key] = this.props.style[key];
        }
      }
    }
    if (styles.ROOT.height) {
      styles.IMAGE.height =
        styles.ROOT.height - styles.BAR.height - styles.PROGRESS_BAR.height + 5;
    }

    this.state = {
      src: '',
      index: 0,
      progress: 0,
      preview: 0,
      previewIndex: 0,
      isFullScreen: false,
    };
  }

  /**
   * componentWillMount
   * updates states with props to render first view.
   * updates image src, page, and progress.
   */
  componentWillMount() {
    const images: Array<string> = this.props.images;
    if (this.isEmptyArray(this.props.images)) {
      return;
    }
    let progress = Math.ceil(100 / images.length);
    if (progress > 100) {
      progress = 100;
    }

    this.setState({
      src: images[0],
      index: 0,
      progress: progress,
      preview: 0,
      previewIndex: 0,
      isFullScreen: false,
    });
  }

  /**
   * shouldComponentUpdate
   * @param {Props} nextProps
   * @param {State} nextState
   * @return {boolean}
   */
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (shallowEqualObject(this.props, nextProps)) {
      return true;
    }

    if (shallowEqualObject(this.state, nextState)) {
      return true;
    }

    if (this.props.images.length !== nextProps.images.length) {
      return true;
    }

    for (let i = 0; i < this.props.images.length; i++) {
      const prev = this.props.images[i];
      const next = nextProps.images[i];
      if (prev !== next) {
        return true;
      }
    }
    return false;
  }

  /**
   * event executed when previous button is clicked.
   * updates image src and page to move previous page.
   */
  onClickPrevButton = () => {
    if (this.isEmptyArray(this.props.images)) {
      return;
    }

    if (this.state.index === 0) {
      return;
    }

    const nextIndex = this.state.index - 1;
    this.updatePageState(nextIndex);
  };

  /**
   * event executed when next button is clicked.
   * updates image src and page to move next page.
   */
  onClickNextButton = () => {
    if (!this.props.images) {
      return;
    }

    if (this.state.index === this.props.images.length - 1) {
      return;
    }
    const nextIndex = this.state.index + 1;
    this.updatePageState(nextIndex);
  };

  /**
   * event executed when progressBar is clicked.
   * updates states to move page.
   * @param {MouseEvent} e
   */
  onClickProgressBar = (e: any) => {
    const nextIndex = this.calcProgressIndex(e);
    if (nextIndex === undefined || nextIndex === null) {
      return;
    }
    this.updatePageState(nextIndex);
  };

  onMouseMoveProgressBar = (e: any) => {
    const nextIndex = this.calcProgressIndex(e);
    this.setState({
      preview: 1,
      previewIndex: nextIndex,
    });
  };

  onMouseLeaveProgressBar = (e: MouseEvent) => {
    this.setState({
      preview: 0,
    });
  };

  onChangeFullScreen = () => {
    const element: Object = document.getElementsByClassName(
      `${this.props.className}-wrapper`,
    )[0];
    const fn = () => {
      const isFullScreen = isFullscreen();
      this.setState({isFullScreen: isFullScreen});
      if (isFullScreen) {
        document.addEventListener('keydown', this.keydownEvent);
        element.style.width = '70%';
      } else {
        document.removeEventListener('keydown', this.keydownEvent);
        element.style.width = '100%';
      }
    };
    Promise.all([toggleFullscreen(element), fullscreenChange(fn)]);
  };

  keydownEvent = (e: Event) => {
    e.preventDefault();
    if (
      e.key === 'ArrowUp' ||
      e.key === 'ArrowLeft' ||
      e.keyCode === 37 ||
      e.keyCode === 38
    ) {
      this.onClickPrevButton();
    } else if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowRight' ||
      e.keyCode === 39 ||
      e.keyCode === 40 ||
      e.keyCode === 32
    ) {
      this.onClickNextButton();
    } else if (e.key === 'Escape' || e.keyCode === 27) {
      this.onChangeFullScreen();
    }
  };

  calcProgressIndex = (e: SyntheticMouseEvent<HTMLElement>): number | void => {
    const parent = e.currentTarget.parentElement;
    if (!parent) {
      return;
    }
    const barWidth = parent.children[0].offsetWidth;
    let progressWidth =
      e.clientX - e.currentTarget.getBoundingClientRect().left;
    const clickPosition = Math.floor(progressWidth / barWidth * 100);
    let nextIndex = 0;
    for (let i = 0; i < this.props.images.length; i++) {
      const checkWidth = this.calcProgress(i);
      if (clickPosition >= checkWidth) {
        nextIndex = i;
      }
    }
    return nextIndex;
  };

  /**
   *
   * @param {number} page
   * @returns {number}
   */
  calcProgress = (page: number): number => {
    const base = 100 / this.props.images.length;
    let progress = Math.ceil(base * page);
    if (progress > 100) {
      return 100;
    }
    return progress;
  };

  isEmptyArray = (arr: Array<string>): boolean => {
    return arr === undefined || arr === null || arr.length === 0;
  };

  updatePageState = (index: number) => {
    const progress = this.calcProgress(index + 1);
    const image = this.props.images[index];
    this.setState({
      src: image,
      index: index,
      progress: progress,
    });
    this.props.pageWillUpdate(index, image);
  };

  /**
   * render
   * @returns {XML}
   */
  render() {
    return (
      <div style={styles.ROOT} className={this.props.className}>
        <div
          className={`${this.props.className}-wrapper`}
          style={{margin: 'auto'}}
        >
          <Viewer
            imgClassName={`${this.props.className}-image`}
            styles={styles}
            src={this.state.src}
            onClickPrevButton={this.onClickPrevButton}
            onClickNextButton={this.onClickNextButton}
            timestamp={this.timestamp}
          />
          <Preview
            opacity={this.state.preview}
            previewIndex={this.state.previewIndex}
            images={this.props.images}
            isFullScreen={this.state.isFullScreen}
            imgClassName={`${this.props.className}-image`}
          />
          <ProgressBar
            style={styles.PROGRESS_BAR}
            onClick={this.onClickProgressBar}
            onMouseMove={this.onMouseMoveProgressBar}
            onMouseLeave={this.onMouseLeaveProgressBar}
            progress={this.state.progress}
          />
          <div style={styles.BAR}>
            <PagingButton onClick={this.onClickPrevButton}>
              {this.props.prevIcon}
            </PagingButton>
            <span style={styles.PAGE_VIEW}>{`${this.state.index + 1} / ${
              this.props.images ? this.props.images.length : 0
            }`}</span>
            <PagingButton onClick={this.onClickNextButton}>
              {this.props.nextIcon}
            </PagingButton>
            {this.props.showFullscreenIcon ? (
              <FullscreenButton onClick={this.onChangeFullScreen}>
                <FullscreenIcon isFullScreen={this.state.isFullScreen} />
              </FullscreenButton>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

SlideShow.defaultProps = {
  arrowButtonStyle: styles.ARROW_BUTTON,
  style: {},
  images: [],
  prevIcon: (
    <svg style={styles.ARROW_BUTTON} viewBox="0 0 8 8">
      <path
        fill="#fff"
        d="M4 0l-4 3 4 3v-6zm0 3l4 3v-6l-4 3z"
        transform="translate(0 1)"
      />
    </svg>
  ),
  nextIcon: (
    <svg style={styles.ARROW_BUTTON} viewBox="0 0 8 8">
      <path
        fill="#fff"
        d="M0 0v6l4-3-4-3zm4 3v3l4-3-4-3v3z"
        transform="translate(0 1)"
      />
    </svg>
  ),
  withTimestamp: false,
  pageWillUpdate: (index: number, image: string) => {
    return;
  },
  className: 'slideshow',
  showFullscreenIcon: true,
};
/**
 * @typedef {Object} Props
 * @property {Object} style
 * @property {Array<string>} images
 * @property {React.Node} prevIcon
 * @property {React.Node} nextIcon
 * @property {boolean} withTimestamp
 * @property {function} pageWillUpdate
 * @property {React.Node} children
 */
export type Props = {
  style: Object,
  images: Array<string>,
  prevIcon: React.Node,
  nextIcon: React.Node,
  withTimestamp: boolean,
  pageWillUpdate: (index: number, image: string) => void,
  showFullscreenIcon: boolean,
  className: string,
  children: React.Node,
};

/**
 * @typedef {Object} State
 * @property {string} src
 * @property {number} index
 * @property {number} progress
 * @property {number} preview
 * @property {number} previewIndex
 * @property {boolean} isFullScreen
 */
export type State = {
  src: string,
  index: number,
  progress: number,
  preview: number,
  previewIndex: number,
  isFullScreen: boolean,
};
