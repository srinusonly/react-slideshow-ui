import * as React from 'react';
import {onlyUpdateForKeys} from 'recompose';

/**
 *
 * @param props
 * @return {XML}
 */
export default onlyUpdateForKeys(['children'])(function({onClick, children}) {
  return (
    <div>
      <button
        style={{
          backgroundColor: 'transparent',
          borderStyle: 'none',
          position: 'absolute',
          right: 10,
          top: 5,
        }}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
});
