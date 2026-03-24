# Using JSDOC-Based TypeScript

## Get Started

### Choose your editor

- WebStorm, Rider
  - Partial support, not enough intellisense hints
  - Toggle on TypeScript language service
- VSCode
  - Full support
  - Working out-of-box
- Emacs?

## Write the code

### Basic

#### function

1. Use @param to declare param type
2. Use @returns to declare return type

```javascript
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}
```

#### variable

1. Use @type to declare the type of a variable

2. Most of the time, it is not necessary to do it, since TypeScript can infer most of the type.

```typescript
/**
 * @type {(number|string)[]}
 */
const c = [5];
```

#### interface

1. Use @typedef to declare interface

2. Interface can be reused

   ```javascript
   /**
    * @typedef People
    * @prop {string} firstName
    * @prop {string} [lastName]
    */

   /**
    * @typedef {{firstName: string, lastName: string}} PeopleTwo
    */

   /**
    * @param {People} people
    */
   function getPeopleName(people) {
     return people.firstName;
   }
   ```

### Work with React

#### Functional component

Exactly the same as declare a function

```jsx
import React from 'react';

/**
 * @typedef Props
 * @prop {React.ReactNode} title
 * @prop {React.ReactNode} [desc]
 * @prop {React.ReactNode} [selectFlightPrompt]
 * @prop {()=>void} [onLogin]
 */

/**
 * @param {Props} props
 */
const InflowHeader = ({ title, desc, selectFlightPrompt, onLogin }) => (
...
);
```

#### Class component

Use @extends Component<Props, State> to declare a stateful component.

> Component<Props, State> is a utility type that returns the type of React component given Props and States.

```jsx
import React, { Component } from "react";

/**
 * @typedef Props
 * @prop {any} resource
 */

/**
 * @typedef State
 * @prop {boolean} isDrawerOpen
 */

/**
 * @extends Component<Props, State>
 */
class SampleContainer extends Component {
  /** @type {State} */
  state = {
    isDrawerOpen: false,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return <React.Fragment>...</React.Fragment>;
  }
}
```

#### Higher order component

Declaring type of higher order component using JSDoc is challenging.

It is recommended to use type declaration files (\*.d.ts) instead.

Higher order component can be categorized as:

- HOC that add new props to a component
- HOC that fill props into a component, e.g. `connect` from 'react-redux'

The following example shows how to declare these two type of higher order component:

```typescript
// HOC that fill props into a component
type withGetImage = <P extends { getImage: () => Promise<void> }>(
  Component: React.ComponentType<P>,
) => React.ComponentType<Omit<P, "getImage">>;

// HOC that add new props to a component
type withGetImageFunctionality = <P extends object>(
  Component: React.ComponentType<P>,
) => React.ComponentType<P & { getImage: () => Promise<void> }>;
```

> Want to learn more? Visit https://medium.com/@jrwebdev/react-higher-order-component-patterns-in-typescript-42278f7590fb for more info

#### Useful built-in type

| propTypes                                          | TS                               |
| -------------------------------------------------- | -------------------------------- |
| count: propTypes.number.isRequired                 | {number} count                   |
| count: propTypes.number                            | {number} [count]                 |
| propTypes.bool                                     | {boolean}                        |
| propTypes.string                                   | {string}                         |
| propTypes.arrayOf(propTypes.number).isRequired     | {number[]}                       |
| propTypes.node                                     | {React.ReactNode}                |
| propTypes.func                                     | {(a: number, b: number)=>number} |
| propTypes.shape({a: number.isRequired, b: number}) | {{a: number, b?: number}}        |
|                                                    |                                  |

> Read more
>
> I have found a few React built-in types quite useful, they are:
>
> FunctionComponent<P>
>
> ComponentType<P>
>
> ComponentClass<P>
>
> FunctionComponent<P>
>
> ComponentProps<T>
>
> ReactHTMLElement
>
> MutableRefObject<ComponentName>

### Work with redux

See **Source/Web/Scripts/dataStore/club/index.js** for detailed examples for using redux in the code base

#### Store

You should declare the store type, which the reducers and selectors will rely on

```javascript
/**
 * @typedef Profile
 * @prop {string} firstName
 * @prop {string} lastName
 * @prop {bool} isStarMember
 */

/**
 * @typedef State
 * @prop {boolean} isLoggedIn
 * @prop {Profile} [profile]
 */

/**
 * @typedef WholeState
 * @prop {State} account
 */
```

##### Explicitly declare the initial state

This practice can help check the initialState is correct.

```typescript
/**
 * @type {State}
 */
const initialState = {
  isLoggedIn: true,
  profile: null,
};
```

#### Action and Reducers

**You should declare the param of action creaters correctly**, so that you can always call the action creator functions correctly

To achieve it:

1. The type have to be declared as string constant
2. Use createAction utility function
3. In the project, some bolier-plate in JSDOC will ease your job

```javascript
// The type has to be declared as constant in HERE
const ACCOUNT__INIT = "ACCOUNT__INIT";

const actionCreators = {
  /**
   * You need to declare the param type for each action creator function.
   * You also have to call the getAction util function
   * @param {{isLoggedIn: boolean}} payload
   */
  init: ({ isLoggedIn }) => getAction(ACCOUNT__INIT, { isLoggedIn }),
};
```

##### Reducer

Declare the type of parameters `state` and `action` like the following code

Also declare the return value of the reducers, this will make sure the reducers are written correctly.

```javascript
/**
 *
 * @param {State} state
 * @param {DataStore.Action<typeof actionCreators>} action
 * @returns {State}
 */
const reducers = (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT__INIT: {
      // TS will guarantee that the payload has the isLoggedIn property
      const { isLoggedIn } = action.payload;
      return {
        ...state,
        isLoggedIn,
      };
    }
    default:
      return state;
  }
};
```

#### Selector

**You should declare the return type of selectors**, so that the user will not use the selectors incorrectly. The declaration of return type also act as a TDD as you can think the behavior of a function before you implement it.

- Declare type of state as `WholeState`
- Declare the return value of complex selector function

```javascript
/**
 * Get booking total
 * @param {WholeState} state
 * @returns {number}
 */
const getTotal = (state) => {
  // ...
};
```

## Check The Code

Option 1:

Use WebStorm or VSCode

Option 2:

Config your Rider correctly

Option 3:

Run the command in the root folder:

```node
yarn ts:check
tsc .
```
