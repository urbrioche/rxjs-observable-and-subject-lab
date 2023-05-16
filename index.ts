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
  combineLatest,
  startWith,
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
// forkJoinHotObservables_never_emit_value_fix3();
// combineLatestColdObservables();
synchronizationStream();
synchronizationStream_hot_observables();
synchronizationStream_hot_observables_startWith();
synchronizationStream_hot_observables_startWith_and_also_emit_later();

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

function combineLatestColdObservables() {
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

  // 這個結果和你想的有一樣嗎
  // 研究一下 https://github.com/ReactiveX/rxjs/blob/master/src/internal/observable/combineLatest.ts 你會發現為什麼會這樣跑
  // 註解也可以進一步研讀，會有收穫的
  combineLatest([data1$, data2$]).subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });
}

function synchronizationStream() {
  // 為了了解combineLatestColdObservables()為什麼那樣跑，增加這個範例
  // 其實就是同步資料流的關係
  // 不要將rxjs都視為非同步資料流，要看情境而定
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

  data1$.subscribe((data) => console.log(data));
  // 上面跑完才跑 -----
  console.log('-----');
  // 然後才跑下面
  data2$.subscribe((data) => console.log(data));
}

function synchronizationStream_hot_observables() {
  // 為了了解combineLatestColdObservables()為什麼那樣跑，增加這個範例
  // 其實就是同步資料流的關係
  // 不要將rxjs都視為非同步資料流，要看情境而定
  const data1$ = new Subject<number>();
  const data2$ = new Subject<string>();
  data1$.subscribe((data) => console.log(data));
  // 上面跑完才跑 *********
  console.log('*********');
  // 然後才跑下面
  data2$.subscribe((data) => console.log(data));
  // 但沒有emit事件，所以，console只會有*********
}

function synchronizationStream_hot_observables_startWith() {
  // 為了了解combineLatestColdObservables()為什麼那樣跑，增加這個範例
  // 其實就是同步資料流的關係
  // 不要將rxjs都視為非同步資料流，要看情境而定
  const data1$ = new Subject<number>();
  const data2$ = new Subject<string>();
  data1$.pipe(startWith(100)).subscribe((data) => console.log(data));
  // 上面跑完才跑 ++++++++
  console.log('++++++++');
  // 然後才跑下面
  data2$.pipe(startWith('ZZ')).subscribe((data) => console.log(data));
}

function synchronizationStream_hot_observables_startWith_and_also_emit_later() {
  // 為了了解combineLatestColdObservables()為什麼那樣跑，增加這個範例
  // 其實就是同步資料流的關係
  // 不要將rxjs都視為非同步資料流，要看情境而定
  const data1$ = new Subject<number>();
  const data2$ = new Subject<string>();
  data1$.pipe(startWith(101)).subscribe((data) => console.log(data));
  // 上面跑完才跑 ########
  console.log('########');
  // 然後才跑下面
  data2$.pipe(startWith('XXY')).subscribe((data) => console.log(data));

  data1$.next(102);
  data2$.next('XXZ');
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
