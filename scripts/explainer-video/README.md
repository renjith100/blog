# AI This Week explainer video

The source of the 40-second tour embedded in
`app/blog/posts/19-what-is-ai-this-week.mdx` (hosted on YouTube:
https://youtu.be/oJvmnOCSzQY).

The video is an animated web page. `render(t)` draws the frame for second `t`,
and `record.mjs` steps through time in headless Chrome, saving one screenshot
per frame. ffmpeg joins the frames into an MP4. Nothing to install: it uses
your Chrome, Node 22's built-in WebSocket, and ffmpeg (`brew install ffmpeg`).

## Make the video

```sh
scripts/explainer-video/make-video.sh                       # out/ai-this-week.mp4, silent
scripts/explainer-video/make-video.sh ~/Downloads/music.mp3 # also out/ai-this-week-with-music.mp4
STILLS=6,19.5,27.5 scripts/explainer-video/make-video.sh    # just PNG stills, for checking
```

A full render takes about a minute and a half. `out/` is git-ignored.

To watch it play live while editing, build it and open `out/scene.html` in a browser:

```sh
node scripts/explainer-video/build.mjs && open scripts/explainer-video/out/scene.html
```

## Files

- `scene.template.html` is the whole animation: the page drawing, the CSS, and
  the timeline. Edit this when the Weekly UI changes.
- `build.mjs` fills the template with every week from `app/weekly/content`,
  the site fonts, and the summary the popup shows, then writes `out/scene.html`.
- `record.mjs` records `out/scene.html` frame by frame.
- `make-video.sh` runs all three steps, and adds music if you pass an MP3.

## Changing it

The timeline is at the bottom of `scene.template.html`:

- `T` holds the key moments (in seconds): when the week is picked, when the popup
  opens and closes, when the outro starts.
- `CAPS` holds the captions: start, end, step number, and text.
- `WAY` holds the cursor waypoints: at time t, glide to this element.
- `CAM` holds the camera: at time t, zoom to this scale, centred on this element.
- `DURATION` is the length in seconds.

These are hard-coded in `scene.template.html`. Update them when you change
the story or want newer weeks in the video:

- `2026-11-16`: the week the page opens on (in `showWeek(...)` inside `render`)
- `2026-11-09`: the week the cursor picks (`T.pick`, `WAY`, `CAM`)
- `2026-10-26`: the week it looks back at (`T.back`, `WAY`, `CAM`)
- `ROWS`: the months and Mondays drawn in the calendar
- `2026-11-23`: the "this week" dot in the calendar
- the `claude-meetings` update the popup shows, plus its title in the popup's
  HTML. `POPUP_UPDATE` in `build.mjs` names the same update.

If one of those weeks has no updates in `app/weekly/content`, the recording
stops with an error that names the week.

## Music

The YouTube upload uses "Last Summer" by Aylex from https://freetouse.com/music.
It's free for non-commercial use with attribution in the video description:

```
Music track: Last Summer by Aylex
Source: https://freetouse.com/music
Free Background Music (No Copyright)
```
