from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def health(_request):
    return Response({"ok": True})

@api_view(["POST"])
def run_code(_request):
    return Response({"output": "Runner is disabled for now. UI test OK."})
