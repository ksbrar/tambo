// Copyright 2018, University of Colorado Boulder

/**
 * a panel that contains controls used to exercise the addition, removal, and disposal of sound generators
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ComboBox = require( 'SUN/ComboBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var OneShotSoundClip = require( 'TAMBO/sound-generators/OneShotSoundClip' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var tambo = require( 'TAMBO/tambo' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  var BUTTON_FONT = new PhetFont( 14 );
  var COMBO_BOX_FONT = new PhetFont( 12 );
  var TOTAL_ADDED_TEMPLATE = 'Total Added: {{numSoundGenerators}}';
  var ADD_BUTTON_COLOR = '#C0D890';

  // TODO: temp for surviving CT
  var FAKE_SG_COUNT = 0;

  // audio
  var sliderIncreaseClickSound = require( 'audio!TAMBO/slider-click-01.mp3' );

  // info needed for selecting and using different sound generators from the combo box
  var SOUND_GENERATOR_INFO = {
    recordedOneShot: {
      comboBoxName: 'Recorded one shot',
      createSoundGenerator: function() {
        return new OneShotSoundClip( sliderIncreaseClickSound );
      }
    },
    recordedLoop: {
      comboBoxName: 'Recorded loop',
      createSoundGenerator: function() {
        // TODO: this is stubbed, needs to be filled in
        console.warn( 'stubbed function called, this will have no effect' );
        return ( FAKE_SG_COUNT++ );
      }
    },
    synthesizedSound: {
      comboBoxName: 'Synthesized sound',
      createSoundGenerator: function() {
        // TODO: this is stubbed, needs to be filled in
        console.warn( 'stubbed function called, this will have no effect' );
        return ( FAKE_SG_COUNT++ );
      }
    }
  };

  /**
   * @param {Object} [options]
   * @constructor
   */
  function RemoveAndDisposeTestPanel( options ) {

    options = _.extend( {
      fill: '#f5d3b3',
      xMargin: 10,
      yMargin: 10
    }, options );

    // array of sound generators that have been added and not yet removed and disposed
    var soundGenerators = new ObservableArray();
    var numberOfSoundGeneratorsAdded = new Property( 0 );

    // node where the content goes, needed so that ComboBox will have a good place to put its list
    var panelContentNode = new Node();

    // informational text that goes at the top of the panel
    var infoText = new Text( 'Test addition, removal, and disposal of sound generators', {
      font: new PhetFont( { size: 14, weight: 'bold' } )
    } );

    // create the combo box for selecting the type of sound generator to add
    var comboBoxItems = [];
    _.keys( SOUND_GENERATOR_INFO ).forEach( function( soundGeneratorKey ) {
      comboBoxItems.push( ComboBox.createItem(
        new Text( SOUND_GENERATOR_INFO[ soundGeneratorKey ].comboBoxName, { font: COMBO_BOX_FONT } ),
        soundGeneratorKey
      ) );
    } );
    var selectedSoundGeneratorTypeProperty = new Property( comboBoxItems[ 0 ].value );
    var comboBox = new ComboBox( comboBoxItems, selectedSoundGeneratorTypeProperty, panelContentNode, {
      buttonFill: 'rgb( 218, 236, 255 )'
    } );
    var sgSelectorNode = new HBox( {
      children: [
        new Text( 'SG type to add:', { font: new PhetFont( 14 ) } ),
        comboBox
      ],
      spacing: 5
    } );

    function addSoundGenerators( numToAdd ) {
      _.times( numToAdd, function() {
        var soundGenerator = SOUND_GENERATOR_INFO[ selectedSoundGeneratorTypeProperty.value ].createSoundGenerator();
        soundGenerators.push( soundGenerator );
      } );
      numberOfSoundGeneratorsAdded.set( numberOfSoundGeneratorsAdded.value + numToAdd );
    }

    // create a horizontal set of buttons for adding sound generators at different orders of magnitude
    var addButtonHBox = new HBox( {
      children: [
        new TextPushButton( 'Add 1', {
          baseColor: ADD_BUTTON_COLOR,
          font: BUTTON_FONT,
          listener: function() {
            addSoundGenerators( 1 );
          }
        } ),
        new TextPushButton( 'Add 10', {
          baseColor: ADD_BUTTON_COLOR,
          font: BUTTON_FONT,
          listener: function() {
            addSoundGenerators( 10 );
          }
        } ),
        new TextPushButton( 'Add 100', {
          baseColor: ADD_BUTTON_COLOR,
          font: BUTTON_FONT,
          listener: function() {
            addSoundGenerators( 100 );
          }
        } )
      ],
      spacing: 10
    } );

    // create a horizontal box with an indicator for the number of sound generators added and a button to remove them all
    var totalAddedIndicator = new Text( TOTAL_ADDED_TEMPLATE, { font: new PhetFont( 14 ) } );
    var showTotalHBox = new HBox( {
      children: [
        totalAddedIndicator,
        new TextPushButton( 'Remove All', {
          font: BUTTON_FONT,
          listener: function() {
            numberOfSoundGeneratorsAdded.reset();
          }
        } )
      ],
      spacing: 10
    } );

    // update the total added indicator when the total changes
    numberOfSoundGeneratorsAdded.link( function( numSGs ) {
      totalAddedIndicator.text = StringUtils.fillIn( TOTAL_ADDED_TEMPLATE, {
        numSoundGenerators: numSGs
      } );
    } );

    // create a button that will test the most recently added sound generator
    var testLastAddedSGButton = new TextPushButton( 'Test last added SG', {
      font: BUTTON_FONT,
      baseColor: '#BABFFF'
    } );

    // add everything to a vertical box
    var rootVBox = new VBox( {
      children: [ infoText, sgSelectorNode, addButtonHBox, showTotalHBox, testLastAddedSGButton ],
      spacing: 14
    } );

    panelContentNode.addChild( rootVBox );

    Panel.call( this, panelContentNode, options );
  }

  tambo.register( 'RemoveAndDisposeTestPanel', RemoveAndDisposeTestPanel );

  return inherit( Panel, RemoveAndDisposeTestPanel );
} );