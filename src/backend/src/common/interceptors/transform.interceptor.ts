import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                // Check if data already has pagination metadata
                if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
                    return {
                        success: true,
                        message: 'Operation completed successfully',
                        data: data.data,
                        meta: data.meta,
                    };
                }

                return {
                    success: true,
                    message: 'Operation completed successfully',
                    data,
                };
            }),
        );
    }
} 