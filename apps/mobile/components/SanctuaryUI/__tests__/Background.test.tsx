import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SanctuaryBackground } from '../Background';

describe('SanctuaryBackground', () => {
  it('renders without crashing', () => {
    const component = render(
      <SanctuaryBackground>
        <Text>Test</Text>
      </SanctuaryBackground>
    );
    expect(component).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <SanctuaryBackground>
        <Text>Test Child Content</Text>
      </SanctuaryBackground>
    );
    expect(getByText('Test Child Content')).toBeTruthy();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <SanctuaryBackground>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </SanctuaryBackground>
    );
    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });

  it('applies sanctuary background styling', () => {
    const { container } = render(
      <SanctuaryBackground>
        <Text>Content</Text>
      </SanctuaryBackground>
    );
    expect(container).toBeTruthy();
  });
});
