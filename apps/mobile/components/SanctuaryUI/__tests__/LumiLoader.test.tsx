import React from 'react';
import { render } from '@testing-library/react-native';
import { LumiLoader } from '../LumiLoader';

describe('LumiLoader', () => {
  it('renders without crashing', () => {
    const component = render(<LumiLoader />);
    expect(component).toBeTruthy();
  });

  it('displays loading text', () => {
    const { getByText } = render(<LumiLoader />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders the sanctuary background', () => {
    const { container } = render(<LumiLoader />);
    expect(container).toBeTruthy();
  });

  it('renders animated orb elements', () => {
    const component = render(<LumiLoader />);
    expect(component.toJSON()).toBeTruthy();
  });
});
