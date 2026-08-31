
export class PlayerController {
  constructor() {
    this.keys = new Set();
    this.mouse = {x: 0, y: 0};
    this.touch = {x: 0, z: 0, sprint: false};
    this.pointerLook = true;

    window.addEventListener("keydown", e => {
      this.keys.add(e.code);
      if (["Space","KeyW","KeyA","KeyS","KeyD","ShiftLeft","ShiftRight"].includes(e.code)) e.preventDefault();
    });
    window.addEventListener("keyup", e => this.keys.delete(e.code));

    window.addEventListener("mousemove", e => {
      if (document.pointerLockElement) {
        this.mouse.x += e.movementX;
        this.mouse.y += e.movementY;
      }
    });

    document.body.addEventListener("click", () => {
      if (window.matchMedia("(pointer:fine)").matches) {
        document.body.requestPointerLock?.();
      }
    });

    this.bindTouchControls();
  }

  bindTouchControls() {
    const joystick = document.getElementById("touch-joystick");
    const knob = document.getElementById("touch-knob");
    if (!joystick || !knob) return;

    let active = false;
    let pointerId = null;
    const radius = 42;

    const updateStick = (clientX, clientY) => {
      const r = joystick.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const len = Math.hypot(dx, dy);
      if (len > radius) {
        dx = dx / len * radius;
        dy = dy / len * radius;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.touch.x = dx / radius;
      this.touch.z = dy / radius;
      this.touch.sprint = false;
    };

    const end = () => {
      active = false;
      pointerId = null;
      this.touch.x = 0;
      this.touch.z = 0;
      knob.style.transform = "translate(0,0)";
    };

    joystick.addEventListener("pointerdown", e => {
      active = true;
      pointerId = e.pointerId;
      joystick.setPointerCapture(pointerId);
      updateStick(e.clientX, e.clientY);
    });
    joystick.addEventListener("pointermove", e => {
      if (active && e.pointerId === pointerId) updateStick(e.clientX, e.clientY);
    });
    joystick.addEventListener("pointerup", end);
    joystick.addEventListener("pointercancel", end);

    const bindButton = (id, code, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("pointerdown", e => {
        e.preventDefault();
        if (onDown) onDown();
        else this.keys.add(code);
      });
      el.addEventListener("pointerup", e => {
        e.preventDefault();
        if (onUp) onUp();
        else this.keys.delete(code);
      });
      el.addEventListener("pointercancel", () => {
        if (onUp) onUp();
        else this.keys.delete(code);
      });
    };

    bindButton("touch-jump", "Space");
    bindButton("touch-interact", "KeyE", () => window.dispatchEvent(new Event("game-interact")));
    bindButton("touch-sprint", "ShiftLeft",
      () => { this.touch.sprint = true; },
      () => { this.touch.sprint = false; }
    );
    bindButton("touch-map", "KeyM");

    const look = document.getElementById("touch-look");
    if (look) {
      let lastX = 0, lastY = 0, looking = false;
      look.addEventListener("pointerdown", e => {
        looking = true; lastX = e.clientX; lastY = e.clientY;
        look.setPointerCapture(e.pointerId);
      });
      look.addEventListener("pointermove", e => {
        if (!looking) return;
        this.mouse.x += (e.clientX - lastX) * 1.6;
        this.mouse.y += (e.clientY - lastY) * 1.6;
        lastX = e.clientX; lastY = e.clientY;
      });
      const stop = () => { looking = false; };
      look.addEventListener("pointerup", stop);
      look.addEventListener("pointercancel", stop);
    }
  }

  get input() {
    const keyboardX = (this.keys.has("KeyD") ? 1 : 0) - (this.keys.has("KeyA") ? 1 : 0);
    const keyboardZ = (this.keys.has("KeyS") ? 1 : 0) - (this.keys.has("KeyW") ? 1 : 0);
    const x = Math.abs(this.touch.x) > .05 ? this.touch.x : keyboardX;
    const z = Math.abs(this.touch.z) > .05 ? this.touch.z : keyboardZ;
    return {
      x, z,
      sprint: this.touch.sprint || this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")
    };
  }

  down(code) {
    return this.keys.has(code);
  }
}
