import './style.css';

import {
  of,
  map,
  Observable,
  from,
  switchMap,
  Subject,
  concatMap,
  mergeMap,
  take,
  tap,
  share,
  first,
  forkJoin,
  takeUntil,
} from 'rxjs';
import { last } from 'rxjs/operators';

// of('World')
//   .pipe(map((name) => `Hello, ${name}!`))
//   .subscribe(console.log);

// Open the console in the bottom right to see results.
// howColdObservableWorks();
// howHotObservableWorks_subscribe_after_event_emit();
// howHotObservableWorks_subscribe_before_event_emit();
// howHotObservableWorks_subscribe_before_and_after_event_emit();
// coldObservableSwitchMapHotObservable();
// coldObservableMergeMapHotObservable();
// coldObservableConcatMapHotObservable();
// coldObservableConcatMapHotObservable_Fix1();
// coldObservableConcatMapColdObservable();
// coldObservableMergeMapColdObservable();
// coldObservableSwitchMapColdObservable();
// coldObservableSwitchMapAsyncColdObservable();
// forkJoinColdObservables();
// forkJoinHotObservables_never_emit_value();
// forkJoinHotObservables_never_emit_value_fix1();
// forkJoinHotObservables_never_emit_value_fix2();
forkJoinHotObservables_never_emit_value_fix3();

function howColdObservableWorks() {
  const data$ = new Observable((subscriber) => {
    subscriber.next('A');
    subscriber.next('B');
    subscriber.next('C');
    subscriber.next('D');
    subscriber.complete();
  });

  // 當訂閱時就會有資料流
  data$.subscribe((it) => {
    console.log(`howColdObservableWorks->第一次訂閱: ${it}`);
  });

  // 第二次訂閱的資料流一樣從頭跑到尾
  data$.subscribe((it) => {
    console.log(`howColdObservableWorks->第二次訂閱: ${it}`);
  });
}

function howHotObservableWorks_subscribe_after_event_emit() {
  const data$ = new Subject();
  data$.next('A');
  data$.next('B');

  data$.subscribe((it) => {
    console.log(`howHotObservableWorks scenario 1: ${it}`);
  });
}

function howHotObservableWorks_subscribe_before_event_emit() {
  const data$ = new Subject();

  data$.subscribe((it) => {
    console.log(`howHotObservableWorks scenario 2: ${it}`);
  });

  data$.next('A+');
  data$.next('B+');
}

function howHotObservableWorks_subscribe_before_and_after_event_emit() {
  const data$ = new Subject();

  data$.next('A++');

  data$.subscribe((it) => {
    console.log(`howHotObservableWorks scenario 3: ${it}`);
  });

  data$.next('B++');
}

function coldObservableSwitchMapHotObservable() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Subject<string>();
  people$.next('Mary');
  people$.next('John');

  data$
    .pipe(switchMap((it) => people$.pipe(map((person) => `${it}:${person}`))))
    .subscribe((person) => {
      console.log(`coldObservableSwitchMapHotObservable: ${person}`);
    });

  people$.next('Iron Man');
  people$.next('Captain America');
}

function coldObservableMergeMapHotObservable() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Subject<string>();
  people$.next('Mary');
  people$.next('John');

  data$
    .pipe(mergeMap((it) => people$.pipe(map((person) => `${it}:${person}`))))
    .subscribe((person) => {
      console.log(`coldObservableMergeMapHotObservable: ${person}`);
    });

  people$.next('Iron Man');
  people$.next('Captain America');
}

function coldObservableConcatMapHotObservable() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Subject<string>();
  people$.next('Mary');
  people$.next('John');

  data$
    .pipe(concatMap((it) => people$.pipe(map((person) => `${it}:${person}`))))
    .subscribe((person) => {
      console.log(`coldObservableConcatMapHotObservable: ${person}`);
    });

  people$.next('Iron Man');
  people$.next('Captain America');
}

function coldObservableConcatMapHotObservable_Fix1() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Subject<string>();
  people$.next('Mary');
  people$.next('John');

  data$
    .pipe(
      concatMap((it) =>
        people$.pipe(
          map((person) => `${it}:${person}`),
          take(2)
        )
      )
    )
    .subscribe((person) => {
      console.log(`coldObservableConcatMapHotObservable_Fix1: ${person}`);
    });

  people$.next('Iron Man');
  people$.next('Captain America');

  setTimeout(() => {
    people$.next('Iron Man 2');
    people$.next('Captain America 2');
  }, 1000);

  //people$.complete();
}

function coldObservableConcatMapColdObservable() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Observable<string>((subscriber) => {
    subscriber.next('Iron Man');
    subscriber.next('Captain America');
    subscriber.complete();
  });

  data$
    .pipe(concatMap((it) => people$.pipe(map((person) => `${it}:${person}`))))
    .subscribe((person) => {
      console.log(`coldObservableConcatMapColdObservable: ${person}`);
    });
}

function coldObservableMergeMapColdObservable() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Observable<string>((subscriber) => {
    subscriber.next('Iron Man');
    subscriber.next('Captain America');
    subscriber.complete();
  });

  data$
    .pipe(mergeMap((it) => people$.pipe(map((person) => `${it}:${person}`))))
    .subscribe((person) => {
      console.log(`coldObservableMergeMapColdObservable: ${person}`);
    });
}

function coldObservableSwitchMapColdObservable() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Observable<string>((subscriber) => {
    subscriber.next('Iron Man');
    subscriber.next('Captain America');
    subscriber.complete();
  });

  data$
    .pipe(switchMap((it) => people$.pipe(map((person) => `${it}:${person}`))))
    .subscribe((person) => {
      console.log(`coldObservableSwitchMapColdObservable: ${person}`);
    });
}

function coldObservableSwitchMapAsyncColdObservable() {
  const data$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const people$ = new Observable<string>((subscriber) => {
    setTimeout(() => {
      subscriber.next('Iron Man');
      // subscriber.next('Captain America');
    }, 500);

    setTimeout(() => {
      // subscriber.next('Iron Man');
      subscriber.next('Captain America');
    }, 600);

    setTimeout(() => {
      subscriber.complete();
    }, 700);
  });

  data$
    .pipe(
      tap((it) => console.log(it)),
      switchMap((it) => people$.pipe(map((person) => `${it}:${person}`)))
    )
    .subscribe((person) => {
      console.log(`coldObservableSwitchMapAsyncColdObservable: ${person}`);
    });
}

function forkJoinColdObservables() {
  const data1$ = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  });

  const data2$ = new Observable((subscriber) => {
    subscriber.next('A');
    subscriber.next('B');
    subscriber.complete();
  });

  forkJoin([data1$, data2$]).subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });
}

function forkJoinHotObservables_never_emit_value() {
  const data1$ = new Subject<number>();

  const data2$ = new Subject<string>();

  forkJoin([data1$, data2$]).subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  data1$.next(1);
  data1$.next(2);

  data2$.next('A');
  data2$.next('B');
}

function forkJoinHotObservables_never_emit_value_fix1() {
  const data1$ = new Subject<number>();

  const data2$ = new Subject<string>();

  forkJoin([data1$, data2$]).subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  data1$.next(1);
  data1$.next(2);
  data1$.complete();

  data2$.next('A');
  data2$.next('B');
  data2$.complete();
}

function forkJoinHotObservables_never_emit_value_fix2() {
  const data1$ = new Subject<number>();

  const data2$ = new Subject<string>();

  // 思考: 用take(n)是否適合
  forkJoin([data1$.pipe(take(1)), data2$.pipe(take(1))]).subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  data1$.next(1);
  data1$.next(2);
  // data1$.complete();

  data2$.next('A');
  data2$.next('B');
  // data2$.complete();
}

function forkJoinHotObservables_never_emit_value_fix3() {
  const data1$ = new Subject<number>();

  const data2$ = new Subject<string>();

  const notifier$ = new Subject<void>();

  const subscription = forkJoin([
    data1$.pipe(takeUntil(notifier$)),
    data2$.pipe(takeUntil(notifier$)),
  ]).subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  console.log('看看close了沒: ', subscription.closed);

  data1$.next(1);
  data1$.next(2);

  data2$.next('A');
  data2$.next('B');
  notifier$.next();

  console.log('看看close了沒: ', subscription.closed);

  // 上面已經完成，下面不會觸發任何事件流
  data1$.next(3);
  data2$.next('C');
  notifier$.next();
}
// const data$ = new Observable((subscriber) => {
//   subscriber.next('A');
//   subscriber.next('B');
//   subscriber.next('C');
//   subscriber.next('D');
//   subscriber.complete();
// });

// data$.subscribe((it) => {
//   console.log(it);
// });

// const dataSubject$ = new Subject<string>();

// const dummy$ = from([null]);

// const dummySubject$ = new Subject();

// dummy$.pipe(switchMap(() => data$)).subscribe((it) => {
//   console.log('"' + it + '"');
// });

// dataSubject$.next('S1');

// dummy$.pipe(switchMap(() => dataSubject$)).subscribe((it) => {
//   console.log('"' + it + '"');
// });

// dataSubject$.next('S2');

// dummySubject$.next('DS1');

// // dummySubject$.pipe(switchMap(() => data$)).subscribe((it) => {
// //   console.log('*' + it + '*');
// // });

// dummySubject$
//   .pipe(
//     //mergeMap((it) =>
//     switchMap((it) =>
//       //concatMap((it) =>
//       dataSubject$.pipe(
//         map((data) => it + ':' + data + ':' + it)
//         //take(2)
//       )
//     )
//   )
//   .subscribe((it) => {
//     console.log('*' + it + '*');
//   });
// //dummySubject$.next('DS2');
// dataSubject$.next('S3');
// dummySubject$.next('DS2');
// dataSubject$.next('S4');
// dataSubject$.next('S5');
// dummySubject$.next('DS3');
// dataSubject$.next('S6');
// dataSubject$.next('S7');
// dataSubject$.next('S8');
