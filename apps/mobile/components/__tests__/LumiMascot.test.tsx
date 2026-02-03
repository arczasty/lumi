import React from 'react';
import { render } from '@testing-library/react-native';
import { LumiMascot } from '../LumiMascot';

describe('LumiMascot', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <LumiMascot isListening={false} amplitude={0} />
    );
    expect(getByTestId).toBeDefined();
  });

  it('renders with default props', () => {
    const component = render(
      <LumiMascot isListening={false} amplitude={0} />
    );
    expect(component).toBeTruthy();
  });

  it('renders when listening is active', () => {
    const component = render(
      <LumiMascot isListening={true} amplitude={0.5} />
    );
    expect(component).toBeTruthy();
  });

  it('renders with different amplitude values', () => {
    const { rerender } = render(
      <LumiMascot isListening={true} amplitude={0} />
    );
    expect(rerender).toBeDefined();

    rerender(<LumiMascot isListening={true} amplitude={0.5} />);
    expect(rerender).toBeDefined();

    rerender(<LumiMascot isListening={true} amplitude={1} />);
    expect(rerender).toBeDefined();
  });

  it('handles isListening prop changes', () => {
    const { rerender } = render(
      <LumiMascot isListening={false} amplitude={0} />
    );

    rerender(<LumiMascot isListening={true} amplitude={0.5} />);
    expect(rerender).toBeDefined();

    rerender(<LumiMascot isListening={false} amplitude={0} />);
    expect(rerender).toBeDefined();
  });
});
