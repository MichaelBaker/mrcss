import MrCss from 'mr-css.es6'

export default function decorate(target) {
  target.prototype._mrCssOriginalRender = target.prototype.render
  target.prototype.render               = MrCss.render
  return target
}
