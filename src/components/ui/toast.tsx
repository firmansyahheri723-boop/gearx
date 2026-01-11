import { For, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { notifications, toast, type Notification, type NotificationType } from '../../stores/notifications';

type TypeStyle = {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

const typeStyles: Record<NotificationType, TypeStyle> = {
  success: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: 'NOM',
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'ERR',
  },
  warning: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: 'WRN',
  },
  info: {
    bg: 'bg-neutral-500/20',
    border: 'border-neutral-500/30',
    text: 'text-neutral-400',
    icon: 'INF',
  },
};

const progressColors: Record<NotificationType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-neutral-500',
};

type ToastItemProps = {
  notification: Notification;
}

function ToastItem(props: ToastItemProps) {
  const [isExiting, setIsExiting] = createSignal(false);
  const [progress, setProgress] = createSignal(100);

  const styles = () => typeStyles[props.notification.type];

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      toast.dismiss(props.notification.id);
    }, 200); // Match animation duration
  };

  onMount(() => {
    const duration = props.notification.duration;
    const interval = 50; // Update progress every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          handleDismiss();
          return 0;
        }
        return next;
      });
    }, interval);

    onCleanup(() => {
      clearInterval(timer);
    });
  });

  return (
    <div
      class={`
        relative overflow-hidden
        w-80 border backdrop-blur-sm
        ${styles().bg} ${styles().border}
        transition-all duration-200 ease-out
        ${isExiting() ? 'animate-toast-out' : 'animate-toast-in'}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div class="flex items-center justify-between px-3 py-2 border-b border-neutral-700/50 bg-neutral-900/60">
        <div class="flex items-center gap-2">
          <div class={`w-1 h-4 ${progressColors[props.notification.type]}`} />
          <span class={`text-[10px] font-bold tracking-wider uppercase ${styles().text}`}>
            {styles().icon}
          </span>
          <span class="text-xs font-semibold tracking-wide uppercase text-neutral-300">
            {props.notification.title}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          class="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="square" stroke-width="2" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <Show when={props.notification.description}>
        <div class="px-3 py-2 bg-neutral-950/50">
          <p class="text-xs text-neutral-400 leading-relaxed">
            {props.notification.description}
          </p>
        </div>
      </Show>

      {/* Progress bar */}
      <div class="h-0.5 bg-neutral-800/50">
        <div
          class={`h-full ${progressColors[props.notification.type]} transition-all duration-50 ease-linear`}
          style={{ width: `${progress()}%` }}
        />
      </div>
    </div>
  );
}

export function Toaster() {
  return (
    <section
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      <For each={notifications}>
        {(notification) => (
          <div class="pointer-events-auto">
            <ToastItem notification={notification} />
          </div>
        )}
      </For>
    </section>
  );
}

function ToastStyles() {
  return (
    <style>{`
      @keyframes toast-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes toast-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .animate-toast-in {
        animation: toast-in 0.2s ease-out forwards;
      }

      .animate-toast-out {
        animation: toast-out 0.2s ease-in forwards;
      }
    `}</style>
  );
}

export function ToasterWithStyles() {
  return (
    <>
      <ToastStyles />
      <Toaster />
    </>
  );
}
