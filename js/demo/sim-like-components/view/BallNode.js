// Copyright 2018, University of Colorado Boulder

/**
 * Particle, represented as a circle with a gradient.  This type does not
 * track a particle, use ParticleView for that.
 */
define( function( require ) {
  'use strict';

  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SonificationManager = require( 'TAMBO/SonificationManager' );
  var SoundClip = require( 'TAMBO/sound-generators/SoundClip' );
  var tambo = require( 'TAMBO/tambo' );

  /**
   * @param {Ball} ball - model of a ball
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BallNode( ball, modelViewTransform ) {

    var self = this;
    Circle.call( this );

    // create a circle node to represent the ball
    var radius = modelViewTransform.modelToViewDeltaX( ball.radius );
    Circle.call( this, radius, { fill: ball.color, stroke: 'gray' } );

    // move this node as the model position changes
    ball.positionProperty.link( function( position ) {
      self.center = modelViewTransform.modelToViewPosition( position );
    } );

    // add sounds

    var sonificationManager = SonificationManager.instance;

    // @public (read-only) {SoundClip} - make these available so that the output level can be adjusted
    this.wallContactSound = new SoundClip( './audio/wall-contact.mp3' );
    this.ceilingFloorContactSound = new SoundClip( './audio/ceiling-floor-contact.mp3' );

    // add the sound generators
    sonificationManager.addSoundGenerator( this.wallContactSound );
    sonificationManager.addSoundGenerator( this.ceilingFloorContactSound );

    ball.velocityProperty.lazyLink( function( newVelocity, oldVelocity ) {
      if ( newVelocity.x === -oldVelocity.x ) {
        self.wallContactSound.play();
      }
      if ( newVelocity.y === -oldVelocity.y ) {
        self.ceilingFloorContactSound.play();
      }
    } );
  }

  tambo.register( 'BallNode', BallNode );

  return inherit( Circle, BallNode );
} );