import React from 'react';
import {render} from 'react-dom';
import SlideShow from '../SlideShow';

/**
 * entry point class for demo
 */
class App extends React.Component {
  /**
   * rendering view
   * @returns {XML}
   */
  render() {
    return (
      <div>
        <SlideShow
          style={{width: 400}}
          index={2}
          updatePageIndex={el => {
            this.setState({updatePageIndex: el});
          }}
          renderCallbacks={obj => (obj.style.width = '50%')}
          images={[
            'https://firebasestorage.googleapis.com/v0/b/stage-seeker.appspot.com/o/events%2FslideImages%2FTEACHERS%20WEBINAR%207th%20May%202018%2Fpage-001.jpg?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/stage-seeker.appspot.com/o/events%2FslideImages%2FTEACHERS%20WEBINAR%207th%20May%202018%2Fpage-002.jpg?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/stage-seeker.appspot.com/o/events%2FslideImages%2FTEACHERS%20WEBINAR%207th%20May%202018%2Fpage-002.jpg?alt=media',
          ]}
          withTimestamp={true}
          pageWillUpdate={(index, image) => {
            console.log(`Page Update! index: ${index}, image: ${image}`);
          }}
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('slideshow'));
