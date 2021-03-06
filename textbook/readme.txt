How to run and install:
https://gist.github.com/iamaureen/53cec0c5498449618dc7b51ed657cd0f

upload Image:

documentation reference:
https://docs.djangoproject.com/en/2.0/ref/request-response/
https://docs.djangoproject.com/en/2.0/ref/files/uploads/#django.core.files.uploadedfile.UploadedFile

additional reference:
http://www.codepool.biz/django-upload-file.html

1. use a form tag to upload an image from the digital textbook html
2. use an ajax request when the submit button is clicked
3. in the server, create a model that will store the image
3. in the server, create a view that will capture the requested image, upload the
image in the server and save the url in the database
4. create an url associated with this view, which is used as the url in step 2
- modify both app/urls.py and textbook/urls.py
- app/urls.py:  url('', views.uploadImage, name='uploadImage'),
- textbook/urls.py:  url('uploadImage/', include('app.urls')),
<when thr submit button is hit, it matches http://127.0.0.1:8000/uploadImage/
which hits the textbook/urls.py and then app/urls.py. and goes to the correct view
5. when submit is clicked, following error was issued:
Forbidden (403)
CSRF verification failed. Request aborted.
solution: Comment out “django.middleware.csrf.CsrfViewMiddleware” in settings.py.
6. when trying to get data from database from html, following error was issued:
No 'Access-Control-Allow-Origin' header is present on the requested resource”
solution:
a. pip install django-cors-headers
b. in django settings.py, add the following:
INSTALLED_APPS = (
    ...
    'corsheaders',
    ...
)

MIDDLEWARE_CLASSES = (
    ...
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...
)

CORS_ORIGIN_ALLOW_ALL = True
source: https://stackoverflow.com/questions/22476273/no-access-control-allow-origin-header-is-present-on-the-requested-resource-i

7. For instant message using Pusher Library:
source:
a. Create account in pusher.com
b. Instantiate a pusher object with the app_id, key, secret, cluster in views.py
c. In the appropriate javascript, bind the event (activityfeed.js)
d. Add the pusher script in the html file (index.html):
<script src="//js.pusher.com/4.0/pusher.min.js"></script>

8. Delete All from database
a. delete the migration files except the 001_initial.py
b. delete the db.sqlite
c. from the terminal, run python manage.py makemigrations and python manage.py migrate
this should clear all the data and also reset the primary key of the tables
