import React, {useCallback, useMemo, useRef, useState} from 'react';
import {PanResponder, Text, useColorScheme, View} from 'react-native';
import {getColors} from '../../theme';
import {createSignaturePadStyles} from './SignaturePad.styles';
import type {
  SignaturePadProps,
  SignaturePoint,
  SignatureStroke,
} from './SignaturePad.types';

function Segment({
  from,
  to,
  color,
}: {
  from: SignaturePoint;
  to: SignaturePoint;
  color: string;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 0.5) {
    return null;
  }
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={{
        position: 'absolute',
        left: from.x,
        top: from.y - 1,
        width: length,
        height: 2.5,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{rotate: `${angle}deg`}],
      }}
    />
  );
}

export function SignaturePad({
  strokes,
  onChange,
  height = 200,
  accessibilityLabel = 'Signature pad',
  editable = true,
  onInteractionStart,
  onInteractionEnd,
}: SignaturePadProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createSignaturePadStyles(colors), [colors]);
  const activeStroke = useRef<SignatureStroke>([]);
  const [, setTick] = useState(0);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const endInteraction = useCallback(() => {
    onInteractionEnd?.();
    if (activeStroke.current.length < 2) {
      activeStroke.current = [];
      setTick(t => t + 1);
      return;
    }
    onChange([...strokesRef.current, activeStroke.current]);
    activeStroke.current = [];
    setTick(t => t + 1);
  }, [onChange, onInteractionEnd]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => editable,
        onStartShouldSetPanResponderCapture: () => editable,
        onMoveShouldSetPanResponder: () => editable,
        onMoveShouldSetPanResponderCapture: () => editable,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: evt => {
          onInteractionStart?.();
          const {locationX, locationY} = evt.nativeEvent;
          activeStroke.current = [{x: locationX, y: locationY}];
          setTick(t => t + 1);
        },
        onPanResponderMove: evt => {
          const {locationX, locationY} = evt.nativeEvent;
          activeStroke.current.push({x: locationX, y: locationY});
          setTick(t => t + 1);
        },
        onPanResponderRelease: () => endInteraction(),
        onPanResponderTerminate: () => endInteraction(),
      }),
    [editable, endInteraction, onInteractionStart],
  );

  const draft = activeStroke.current;
  const inkColor = colors.text;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Sign in the box below</Text>
      <View
        {...(editable ? panResponder.panHandlers : undefined)}
        collapsable={false}
        style={[
          styles.pad,
          {height},
          draft.length > 0 && styles.padActive,
          !editable && styles.padLocked,
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        accessibilityState={{disabled: !editable}}>
        {strokes.map((stroke, strokeIndex) =>
          stroke.slice(1).map((point, index) => (
            <Segment
              key={`${strokeIndex}-${index}`}
              from={stroke[index]}
              to={point}
              color={inkColor}
            />
          )),
        )}
        {draft.slice(1).map((point, index) => (
          <Segment
            key={`draft-${index}`}
            from={draft[index]}
            to={point}
            color={inkColor}
          />
        ))}
      </View>
      <Text style={styles.hint}>
        {editable
          ? 'Draw in the box above'
          : 'Signature locked for verification'}
      </Text>
    </View>
  );
}

export default SignaturePad;
