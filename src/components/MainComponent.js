import React, { Component, Fragment } from 'react';
import Tone from 'tone';
import styles from '../styles/App.module.scss';
import StartAudioContext from 'startaudiocontext';
import NoteContainer from '../containers/NoteContainer';
import SoundListContainer from '../containers/SoundListContainer';

class MainComponent extends Component {
  constructor(props) {
    super(props);
    StartAudioContext(Tone.context);

    const playerSetting = {
      "volume": 0,
      "fadeOut": "64n",
    };

    let keys = new Tone.Players(this.props.soundList, playerSetting).toMaster();

    let loop = new Tone.Sequence((time, noteIdx, test) => {
      this.props.setNoteIndex(noteIdx);
      for (let i = 0; i < this.props.beat.length; i++) {
        const nowBeat = Object.keys(this.props.beat[i])[0];
        if (Object.keys(this.props.soundList).indexOf(nowBeat) > -1) {
          if (this.props.beat[i][nowBeat][noteIdx] === 'x') {
            if (this.props.muteBeat.indexOf(nowBeat) < 0) {
              this.keys.get(nowBeat).start(time, 0, "1n", 0);
            }
          }
        }
      }
    }, this.props.initEvents, "16n");
    Tone.Transport.bpm.value = +this.props.bpm;
    this.loop = loop;
    loop.start();
    this.keys = keys;
  }

  componentDidMount() {
    this.props.onBeatLoad(
      this.props.router.location.pathname,
      this.props.soundList,
      this.keys,
      Tone.Transport.bpm
    );
  }

  onStop() {
    Tone.Transport.stop();
    this.props.onBeatState('stop');
    setTimeout(() => {
      this.props.onBeatInit();
    }, 100);
  }

  onPlay() {
    if (!this.props.isSoundUploadAndLoding) {
      Tone.Transport.start();
      this.props.onBeatState('play');
    }
  }

  onPause() {
    Tone.Transport.pause();
    this.props.onBeatState('pause');
  }

  onRangeHandler(ev) {
    if (this.props.isPlay === 'play') {
      const rangePromise = new Promise((resolve, reject) => {
        Tone.Transport.pause();
        Tone.Transport.bpm.value = +ev.target.value;
        this.props.setBeatBpm(+ev.target.value);
        resolve();
      })
      rangePromise.then(() => {
        Tone.Transport.start();
      });
    } else {
      Tone.Transport.bpm.value = +ev.target.value;
      this.props.setBeatBpm(+ev.target.value);
    }
  }

  onClickEventCancel(ev) {
    if (ev.target.dataset.event !== 'selectBeat') {
      this.props.onBeatListShow(false);
    }
  }

  onBeatSave() {
    this.props.onBeatSave(this.props.beat, this.props.bpm);
  }

  onClipboardCopy(ev) {
    ev.target.focus();
    ev.target.setSelectionRange(0, ev.target.value.length);
    document.execCommand("copy");
  }

  render() {
    return (
      <Fragment>
        <div className={styles.App} onClick={this.onClickEventCancel.bind(this)}>
          <header>
            <div className={styles.headerWrap}>
              <h1>Beat Up</h1>
            </div>
          </header>
          <div className={styles.statusBar}>
            <div className={styles.menuWrap}>
              <button id="start" onClick={this.onPlay.bind(this)}>Play</button>
              <button onClick={this.onPause.bind(this)}>Pause</button>
              <button onClick={this.onStop.bind(this)}>Stop</button>
              <button onClick={this.onBeatSave.bind(this)}>Save</button>
            </div>
          </div>
          <div className={styles.playerWrap}>
            <NoteContainer
              players={this.keys}
            />
          </div>
          <div className={styles.listControlWrap}>
            <div className={styles.listControl}>
              <div className={styles.ControlButtonWrap}>
                {this.props.beat.length < this.props.maxLine ? <button onClick={this.props.addBeatLine.bind(this)}>Add line</button> : null}
                <button onClick={this.props.removeBeatLine.bind(this)}>Remove line</button>
              </div>
              <div className={styles.bpmWrap}>
                <div className={styles.bpmTextWarp}>
                  <span>BPM: </span>
                  <strong>{this.props.bpm}</strong>
                </div>
                <div className={styles.controlBar}>
                  <input
                    type="range"
                    defaultValue={this.props.bpm}
                    min="60"
                    max="200"
                    onChange={this.onRangeHandler.bind(this)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.beatListWrap}>
            <div className={styles.beatList} data-event="selectBeat">
              <SoundListContainer keys={this.keys} />
            </div>
          </div>
        </div>
        {
          this.props.saveUrlShow &&
          <div className={styles.popup}>
            <input type="text" defaultValue={`${window.location.origin}/${this.props.saveUrl}`} readOnly onClick={this.onClipboardCopy.bind(this)} />
            <button onClick={this.props.onBeatSaveShow.bind(this, false)}>Close</button>
          </div>
        }
      </Fragment>
    )
  }
}

export default MainComponent;
