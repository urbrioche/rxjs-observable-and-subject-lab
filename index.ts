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
  Subscriber,
  ReplaySubject,
} from 'rxjs';
import { last, shareReplay } from 'rxjs/operators';

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
// synchronizationStream();
// synchronizationStream_hot_observables();
// synchronizationStream_hot_observables_startWith();
// synchronizationStream_hot_observables_startWith_and_also_emit_later();
// useShareToMultiCastColdObserable_not_working();
// useShareToMultiCastColdObserable_not_working_fix();
// useShareToMultiCastHotObservable();
// share_work_on_late_subscribe_scenario();
share_not_work_on_late_subscribe_scenario();

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

function useShareToMultiCastColdObserable_not_working() {
  let sub: Subscriber<unknown>;
  const data1$ = new Observable((subscriber) => {
    console.log('start');
    setTimeout(() => {}, 500);
    sub = subscriber;
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.next(4);
    subscriber.next(5);
    subscriber.complete();
    console.log('end');
  });

  //https://www.bitovi.com/blog/always-know-when-to-use-share-vs.-sharereplay
  // cold observable 不如預期，似乎要用shareReplay
  const dataShare$ = data1$.pipe(share());
  // 預期結果 data$內的subscriber只會進入一次，所以，理論上start...end 只會出現一次
  // 但是，結果卻是出現兩次

  // 下面的程式是同步行為
  // 先跑這
  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  // 再跑這
  console.log('**********');

  // 最後跑這
  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  // https://github.com/ReactiveX/rxjs/blob/3d69bbc1e95957e65c22984f4e795ff4ca9e4628/src/internal/operators/share.ts#L203
  // 看一下這段原始嗎，就不難理解為什麼會不如預期了
}

function useShareToMultiCastColdObserable_not_working_fix() {
  let sub: Subscriber<unknown>;
  const data1$ = new Observable((subscriber) => {
    console.log('start');
    setTimeout(() => {}, 500);
    sub = subscriber;
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.next(4);
    subscriber.next(5);
    subscriber.complete();
    console.log('end');
  });

  //https://www.bitovi.com/blog/always-know-when-to-use-share-vs.-sharereplay
  // cold observable 不如預期，似乎要用shareReplay
  const dataShare$ = data1$.pipe(
    share({ resetOnComplete: false, connector: () => new ReplaySubject() })
  );
  // 預期結果 data$內的subscriber只會進入一次，所以，start...end 只會出現一次

  // 下面的程式是同步行為
  // 先跑這，跑完資料流會complete，藉由resetOnComplete:false 來解決
  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  // 再跑這
  console.log('**********');

  // 最後跑這
  // 將connector改為 replaySubject 解決這段內部的subject的訂閱，是在emit事件後 (很抽象，多看原始嗎才能理解)
  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  // https://github.com/ReactiveX/rxjs/blob/3d69bbc1e95957e65c22984f4e795ff4ca9e4628/src/internal/operators/share.ts#L203
  // 看一下這段原始嗎，就不難理解為什麼會不如預期了
}

function useShareToMultiCastHotObservable() {
  const data$ = new Subject<number>();

  const dataShare$ = data$.pipe(
    tap(() => console.log('should only enter once when each value emit')),
    share()
  );

  dataShare$.subscribe({
    next: (value) => {
      console.log(value);
    },
    complete: () => {
      console.log('complete');
    },
  });

  dataShare$.subscribe({
    next: (value) => {
      console.log(value);
    },
    complete: () => {
      console.log('complete');
    },
  });

  data$.next(1);
  data$.next(2);
}

function share_work_on_late_subscribe_scenario() {
  // 模擬http請求
  const getData = (): Observable<string[]> => {
    return new Observable<string[]>((subscriber) => {
      console.log('getData...');
      // 5秒後資料回來
      setTimeout(() => {
        subscriber.next(['John', 'Hulk']);
        subscriber.complete();
      }, 5000);
    });
  };

  const dataShare$ = getData().pipe(share());
  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  console.log('**********');

  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  // late subscribe after 4 seconds, but api call take 5 seconds
  // 主要是網路上有一些文章用setTimeout來解說late subscribe不會share()
  // 但，其實要看是“多晚”訂閱
  // 像這種情形是有share的
  // getData...只出現一次
  setTimeout(() => {
    dataShare$.subscribe({
      next: (data) => console.log(data),
      complete: () => console.log('complete'),
    });
  }, 4000);
}

function share_not_work_on_late_subscribe_scenario() {
  // 模擬http請求
  const getData = (): Observable<string[]> => {
    return new Observable<string[]>((subscriber) => {
      console.log('getData...');
      // 5秒後資料回來
      setTimeout(() => {
        subscriber.next(['John', 'Hulk']);
        subscriber.complete();
      }, 5000);
    });
  };

  const dataShare$ = getData().pipe(share());
  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  console.log('**********');

  dataShare$.subscribe({
    next: (data) => console.log(data),
    complete: () => console.log('complete'),
  });

  // late subscribe after 6 seconds, but api call take 5 seconds
  // 主要是網路上有一些文章用setTimeout來解說late subscribe不會share()
  // 但，其實要看是“多晚”訂閱
  // 像這種情形是不會share的
  // getData...只會出現兩次
  setTimeout(() => {
    dataShare$.subscribe({
      next: (data) => console.log(data),
      complete: () => console.log('complete'),
    });
  }, 6000);
}
