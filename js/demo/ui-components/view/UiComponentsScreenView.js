// Copyright 2018, University of Colorado Boulder

/**
 * view for a screen that demonstrates views and sounds for components that interact with the model in some way
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ABSwitch = require( 'SUN/ABSwitch' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Checkbox = require( 'SUN/Checkbox' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  var LoopingSoundClip = require( 'TAMBO/sound-generators/LoopingSoundClip' );
  var OneShotSoundClip = require( 'TAMBO/sound-generators/OneShotSoundClip' );
  var Range = require( 'DOT/Range' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ResetAllSound = require( 'TAMBO/demo/common/audio/ResetAllSound' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var soundManager = require( 'TAMBO/soundManager' );
  var SoundToggleButton = require( 'SCENERY_PHET/buttons/SoundToggleButton' );
  var tambo = require( 'TAMBO/tambo' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

  // constants
  var SLIDER_MAX = 5;
  var NUM_TICK_MARKS = SLIDER_MAX + 1;

  // images
  var lightningImage = require( 'image!TAMBO/lightning.png' );

  // audio
  var chargesInBody = require( 'audio!TAMBO/charges-in-body-better.mp3' );
  var marimbaSound = require( 'audio!TAMBO/bright-marimba.mp3' );
  var sliderIncreaseClickSound = require( 'audio!TAMBO/slider-click-01.mp3' );
  var sliderDecreaseClickSound = require( 'audio!TAMBO/slider-click-02.mp3' );
  var thunderSound = require( 'audio!TAMBO/thunder.mp3' );

  /**
   * @constructor
   */
  function UiComponentsScreenView( model ) {
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 768, 504 )
    } );

    // add a slider with snap-to-ticks behavior
    var discreteSlider = new HSlider( model.discreteValueProperty, new Range( 0, SLIDER_MAX ), {
      left: 100,
      top: 100,
      constrainValue: function( value ) {
        return Math.round( value );
      },
      keyboardStep: 1
    } );
    _.times( NUM_TICK_MARKS, function( index ) {
      discreteSlider.addMinorTick( index );
    } );
    this.addChild( discreteSlider );

    // add a sound generator that will play a sound when the value controlled by the slider changes
    var increaseClickSound = new OneShotSoundClip( sliderIncreaseClickSound );
    soundManager.addSoundGenerator( increaseClickSound );
    var decreaseClickSound = new OneShotSoundClip( sliderDecreaseClickSound );
    soundManager.addSoundGenerator( decreaseClickSound, { disabledDuringReset: true } );
    model.discreteValueProperty.lazyLink( function( newValue, oldValue ) {
      if ( newValue > oldValue ) {
        increaseClickSound.play();
      }
      else {
        decreaseClickSound.play();
      }
    } );

    // add an AB switch that will turn on/off a looping sound
    var abSwitch = new ABSwitch(
      model.loopOnProperty,
      false,
      new Text( 'Off' ),
      true,
      new Text( 'On' ),
      { switchSize: new Dimension2( 40, 20 ), centerX: discreteSlider.centerX, top: discreteSlider.bottom + 40 }
    );
    this.addChild( abSwitch );

    // add a looping sound that is turned on/off by the switch
    var loopingSound = new LoopingSoundClip( chargesInBody );
    soundManager.addSoundGenerator( loopingSound, { associatedViewNode: abSwitch } );
    model.loopOnProperty.link( function( loopOn ) {

      // start the loop the first time the switch is set to the on position
      if ( loopOn && !loopingSound.isPlaying ) {
        loopingSound.start();
      }
      else if ( !loopOn && loopingSound.isPlaying ) {
        loopingSound.stop();
      }
    } );

    // Add a slider with continuous behavior.  We create our own thumb node so that we can observe it.
    var continuousSlider = new HSlider( model.continuousValueProperty, new Range( 0, SLIDER_MAX ), {
      thumbFillEnabled: '#880000',
      thumbFillHighlighted: '#aa0000',
      left: discreteSlider.left,
      top: abSwitch.bottom + 40
    } );
    this.addChild( continuousSlider );

    // Play a sound when certain threshold values are crossed by the continuous property value, or when a change occurs
    // in the absence of interaction with the slider, since that implies keyboard-driven interaction.
    var marimbaSoundGenerator = new OneShotSoundClip( marimbaSound );
    soundManager.addSoundGenerator( marimbaSoundGenerator );

    // define a function that will play the marimba sound at a pitch value based on the continuous value property
    function playSoundForContinuousValue() {
      var playbackRate = Math.pow( 2, model.continuousValueProperty.get() / SLIDER_MAX );
      marimbaSoundGenerator.setPlaybackRate( playbackRate );
      marimbaSoundGenerator.play();
    }

    // add sound generation for changes that occur due to keyboard interaction
    continuousSlider.addAccessibleInputListener( {
      keydown: function( event ) {
        if ( KeyboardUtil.isRangeKey( event.keyCode ) ) {
          playSoundForContinuousValue();
        }
      }
    } );

    model.continuousValueProperty.lazyLink( function( newValue, oldValue ) {

      // TODO: Parts of the following code may eventually be moved to constants, but it is here for now to make it
      // easier to grab this chunk of code and turn it into a standalone sound generator, which is the most likely
      // scenario at the time of this writing.
      var numBins = 8;
      var binSize = SLIDER_MAX / numBins;

      function mapValueToBin( value ) {
        return Math.min( Math.floor( value / binSize ), numBins - 1 );
      }

      // Play the sound when certain threshold values are crossed or when a change occurs in the absence of mouse/touch
      // interaction with the slider, which implies keyboard-driven interaction.
      if ( continuousSlider.thumbDragging && (
        mapValueToBin( newValue ) !== mapValueToBin( oldValue ) ||
        newValue === 0 && oldValue !== 0 ||
        newValue === SLIDER_MAX && oldValue !== SLIDER_MAX ) ) {

        playSoundForContinuousValue();
      }
    } );

    // add the button that will cause a lightening bolt to be shown for a time
    var fireLightningButton = new TextPushButton( 'Lightning', {
      left: discreteSlider.right + 40,
      centerY: discreteSlider.centerY,
      listener: function() {
        model.lightningBoltVisibleProperty.set( true );
      }
    } );
    this.addChild( fireLightningButton );

    // disable button while lightning is visible
    model.lightningBoltVisibleProperty.link( function( lightningBoltVisible ) {
      fireLightningButton.enabled = !lightningBoltVisible;
    } );

    // add the lightning bolt that will be shown for a time when the user indicates
    var lightningNode = new Image( lightningImage, {
      left: fireLightningButton.left,
      top: fireLightningButton.bottom,
      maxHeight: 40
    } );
    this.addChild( lightningNode );
    model.lightningBoltVisibleProperty.linkAttribute( lightningNode, 'visible' );

    // make a sound when the lightning bolt appears
    var thunder = new OneShotSoundClip( thunderSound );
    soundManager.addSoundGenerator( thunder );
    model.lightningBoltVisibleProperty.link( function( visible ) {
      if ( visible ) {
        thunder.play();
      }
    } );

    // add a check box that controls whether the thunder sound is played when the lightning bolt is shown
    this.addChild( new Checkbox( new Text( 'Thunder' ), thunder.locallyEnabledProperty, {
      boxWidth: 12,
      left: fireLightningButton.right + 5,
      centerY: fireLightningButton.centerY
    } ) );

    // add the reset all button
    var resetAllButton = new ResetAllButton( {
      right: this.layoutBounds.maxX - 20,
      bottom: this.layoutBounds.maxY - 20,
      listener: function() {
        model.reset();
        thunder.locallyEnabledProperty.reset();
      }
    } );
    this.addChild( resetAllButton );
    soundManager.addSoundGenerator( new ResetAllSound( model.resetInProgressProperty ) );

    // add the sound toggle button
    var soundToggleButton = new SoundToggleButton( soundManager.enabledProperty, {
      right: resetAllButton.left - 10,
      centerY: resetAllButton.centerY
    } );
    this.addChild( soundToggleButton );

    // hook up the reset-in-progress property to the sonification manager so sounds can be muted during reset
    soundManager.addResetInProgressProperty( model.resetInProgressProperty );
  }

  tambo.register( 'UiComponentsScreenView', UiComponentsScreenView );

  return inherit( ScreenView, UiComponentsScreenView );
} );